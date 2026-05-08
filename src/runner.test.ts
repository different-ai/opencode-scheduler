import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import { rmSync } from "fs"
import { join } from "path"
import { tmpdir } from "os"
import {
  type Job,
  type JobRunSpec,
  deliverLive,
  ensureLiveSession,
  getSessionBusy,
  parseArgs,
  preflight,
  pollUntilIdle,
  resolveLiveAttachUrl,
  runLive,
  trimBaseUrl,
} from "./runner"
import type { RegistryEntry } from "./registry"

interface ServerState {
  busy: Set<string>
  sessions: Set<string>
  promptDeliveries: Array<{ sessionId: string; body: unknown }>
  healthOk: boolean
  selectSessionCalls: number
  toastCalls: number
}

function makeServer(state: ServerState) {
  return Bun.serve({
    port: 0,
    async fetch(req) {
      const url = new URL(req.url)
      if (url.pathname === "/global/health") {
        return new Response("{}", {
          status: state.healthOk ? 200 : 500,
          headers: { "Content-Type": "application/json" },
        })
      }
      if (url.pathname === "/session/status" && req.method === "GET") {
        const map: Record<string, { status: string }> = {}
        for (const sid of state.busy) map[sid] = { status: "busy" }
        return new Response(JSON.stringify(map), { status: 200 })
      }
      if (url.pathname === "/session" && req.method === "POST") {
        const body = (await req.json().catch(() => ({}))) as { title?: string }
        const id = `ses_${Math.floor(Math.random() * 1e9)}`
        state.sessions.add(id)
        return new Response(JSON.stringify({ id, title: body.title ?? "" }), { status: 200 })
      }
      const sessionMatch = url.pathname.match(/^\/session\/([^/]+)$/)
      if (sessionMatch && req.method === "GET") {
        const sid = decodeURIComponent(sessionMatch[1])
        if (!state.sessions.has(sid)) return new Response("not found", { status: 404 })
        return new Response(JSON.stringify({ id: sid }), { status: 200 })
      }
      const promptMatch = url.pathname.match(/^\/session\/([^/]+)\/prompt_async$/)
      if (promptMatch && req.method === "POST") {
        const sid = decodeURIComponent(promptMatch[1])
        if (!state.sessions.has(sid)) return new Response("not found", { status: 404 })
        const body = await req.json().catch(() => ({}))
        state.promptDeliveries.push({ sessionId: sid, body })
        return new Response(null, { status: 204 })
      }
      if (url.pathname === "/tui/select-session") {
        state.selectSessionCalls += 1
        return new Response(null, { status: 204 })
      }
      if (url.pathname === "/tui/show-toast") {
        state.toastCalls += 1
        return new Response(null, { status: 204 })
      }
      return new Response("not found", { status: 404 })
    },
  })
}

describe("parseArgs", () => {
  test("requires --job", () => {
    expect(() => parseArgs([])).toThrow(/usage/)
  })
  test("parses --job and --timeout-seconds", () => {
    const a = parseArgs(["--job", "/tmp/j.json", "--timeout-seconds", "30"])
    expect(a.jobPath).toBe("/tmp/j.json")
    expect(a.timeoutSeconds).toBe(30)
  })
  test("ignores unknown flags rather than throwing (forward compat)", () => {
    const a = parseArgs(["--job", "/tmp/j.json", "--unknown-future-flag", "x"])
    expect(a.jobPath).toBe("/tmp/j.json")
  })
})

describe("trimBaseUrl", () => {
  test("strips trailing slashes", () => {
    expect(trimBaseUrl("http://x/")).toBe("http://x")
    expect(trimBaseUrl("http://x///")).toBe("http://x")
    expect(trimBaseUrl("http://x")).toBe("http://x")
  })
})

describe("runner against in-process Bun.serve stub", () => {
  let state: ServerState
  let server: ReturnType<typeof makeServer>
  let baseUrl: string
  let runsDir: string

  beforeAll(() => {
    runsDir = join(tmpdir(), `runner-test-${process.pid}`)
    process.env.HOME = runsDir
  })

  afterAll(() => {
    try {
      rmSync(runsDir, { recursive: true, force: true })
    } catch {}
  })

  function fresh() {
    if (server) server.stop()
    state = {
      busy: new Set(),
      sessions: new Set(),
      promptDeliveries: [],
      healthOk: true,
      selectSessionCalls: 0,
      toastCalls: 0,
    }
    server = makeServer(state)
    baseUrl = `http://127.0.0.1:${server.port}`
  }

  test("preflight: ok when server healthy and session exists", async () => {
    fresh()
    state.sessions.add("ses_x")
    const result = await preflight({ baseUrl, sessionId: "ses_x" })
    expect(result).toBe("ok")
  })

  test("preflight: no-server when health fails", async () => {
    fresh()
    state.healthOk = false
    const result = await preflight({ baseUrl, sessionId: "ses_x" })
    expect(result).toBe("no-server")
  })

  test("preflight: no-session when session 404s", async () => {
    fresh()
    const result = await preflight({ baseUrl, sessionId: "ses_missing" })
    expect(result).toBe("no-session")
  })

  test("getSessionBusy: false for idle, true for busy", async () => {
    fresh()
    expect(await getSessionBusy(baseUrl, "ses_a")).toBe(false)
    state.busy.add("ses_a")
    expect(await getSessionBusy(baseUrl, "ses_a")).toBe(true)
  })

  test("ensureLiveSession: returns existing id without create", async () => {
    fresh()
    const out = await ensureLiveSession({
      baseUrl,
      job: { slug: "x", name: "X" } as Job,
      existingSessionId: "ses_existing",
    })
    expect(out).toEqual({ sessionId: "ses_existing", created: false })
    expect(state.sessions.size).toBe(0)
  })

  test("ensureLiveSession: creates new session when none provided", async () => {
    fresh()
    const out = await ensureLiveSession({
      baseUrl,
      job: { slug: "x", name: "Test Job" } as Job,
    })
    expect(out.created).toBe(true)
    expect(out.sessionId).toMatch(/^ses_/)
    expect(state.sessions.has(out.sessionId)).toBe(true)
  })

  test("deliverLive: posts prompt_async with parts", async () => {
    fresh()
    state.sessions.add("ses_p")
    const { httpStatus } = await deliverLive({
      baseUrl,
      sessionId: "ses_p",
      prompt: "hello",
      files: ["/tmp/a.txt"],
      noReply: false,
    })
    expect(httpStatus).toBe(204)
    expect(state.promptDeliveries.length).toBe(1)
    const delivered = state.promptDeliveries[0]
    expect(delivered.sessionId).toBe("ses_p")
    const body = delivered.body as { noReply: boolean; parts: Array<{ type: string }> }
    expect(body.noReply).toBe(false)
    expect(body.parts[0].type).toBe("text")
    expect(body.parts[1].type).toBe("file")
  })

  test("runLive: success path returns exit 0 with httpStatus", async () => {
    fresh()
    state.sessions.add("ses_ok")
    const result = await runLive({
      job: { slug: "x", name: "X" } as Job,
      attachUrl: baseUrl,
      sessionId: "ses_ok",
      prompt: "ping",
      files: [],
      deliveryPolicy: "execute",
      timeoutSeconds: 5,
    })
    expect(result.exitCode).toBe(0)
    expect(result.record.httpStatus).toBe(204)
    expect(result.record.delivery).toBe("live")
  })

  test("runLive: session 404 returns exit 11", async () => {
    fresh()
    const result = await runLive({
      job: { slug: "x", name: "X" } as Job,
      attachUrl: baseUrl,
      sessionId: "ses_missing",
      prompt: "ping",
      files: [],
      deliveryPolicy: "execute",
      timeoutSeconds: 5,
    })
    expect(result.exitCode).toBe(11)
    expect(result.record.error).toMatch(/session not found/)
  })

  test("runLive: server unreachable returns exit 10", async () => {
    fresh()
    server.stop()
    const result = await runLive({
      job: { slug: "x", name: "X" } as Job,
      attachUrl: baseUrl,
      sessionId: "ses_x",
      prompt: "ping",
      files: [],
      deliveryPolicy: "execute",
      timeoutSeconds: 5,
    })
    expect(result.exitCode).toBe(10)
    expect(result.record.error).toMatch(/unreachable/)
  })

  test("runLive: busy + execute waits then succeeds when session goes idle", async () => {
    fresh()
    const sid = "ses_busy"
    state.sessions.add(sid)
    state.busy.add(sid)
    setTimeout(() => state.busy.delete(sid), 250)

    const result = await runLive({
      job: { slug: "x", name: "X" } as Job,
      attachUrl: baseUrl,
      sessionId: sid,
      prompt: "ping",
      files: [],
      deliveryPolicy: "execute",
      timeoutSeconds: 5,
    })
    expect(result.exitCode).toBe(0)
  })

  test("runLive: busy + leave-message delivers immediately with noReply", async () => {
    fresh()
    const sid = "ses_busy2"
    state.sessions.add(sid)
    state.busy.add(sid)

    const result = await runLive({
      job: { slug: "x", name: "X" } as Job,
      attachUrl: baseUrl,
      sessionId: sid,
      prompt: "queued",
      files: [],
      deliveryPolicy: "leave-message",
      timeoutSeconds: 5,
    })
    expect(result.exitCode).toBe(0)
    const body = state.promptDeliveries[0]?.body as { noReply: boolean }
    expect(body.noReply).toBe(true)
  })

  test("runLive: new-per-run creates session via REST when no sessionId provided", async () => {
    fresh()
    const result = await runLive({
      job: { slug: "x", name: "Per-run job" } as Job,
      attachUrl: baseUrl,
      sessionId: undefined,
      prompt: "ping",
      files: [],
      deliveryPolicy: "execute",
      timeoutSeconds: 5,
    })
    expect(result.exitCode).toBe(0)
    expect(state.sessions.size).toBe(1)
  })

  test("pollUntilIdle: returns true when busy clears in time", async () => {
    fresh()
    const sid = "ses_p1"
    state.busy.add(sid)
    setTimeout(() => state.busy.delete(sid), 100)
    const ok = await pollUntilIdle({ baseUrl, sessionId: sid, timeoutSeconds: 2, intervalMs: 50 })
    expect(ok).toBe(true)
  })

  test("pollUntilIdle: returns false when busy persists past timeout", async () => {
    fresh()
    const sid = "ses_p2"
    state.busy.add(sid)
    const ok = await pollUntilIdle({ baseUrl, sessionId: sid, timeoutSeconds: 1, intervalMs: 100 })
    expect(ok).toBe(false)
  })
})

describe("resolveLiveAttachUrl (F5 discovery glue)", () => {
  const baseJob: Job = { slug: "x", name: "X", workdir: "/proj" }

  const registryEntry = (overrides: Partial<RegistryEntry> = {}): RegistryEntry => ({
    schemaVersion: 1,
    pid: 1,
    port: 4096,
    url: "http://127.0.0.1:4096/",
    workdir: "/proj",
    startedAt: "2026-05-03T10:00:00Z",
    ...overrides,
  })

  test("explicit attachUrl on the job: source='job', no discovery call", async () => {
    let discoverCalled = false
    const result = await resolveLiveAttachUrl({
      job: baseJob,
      run: { attachUrl: "http://example.com:5000", session: "ses_x" } as JobRunSpec,
      executionPolicy: "prefer-live-server",
      discover: async () => {
        discoverCalled = true
        return undefined
      },
    })
    expect(result).toEqual({ attachUrl: "http://example.com:5000", source: "job" })
    expect(discoverCalled).toBe(false)
  })

  test("legacy job.attachUrl is honoured when run.attachUrl is missing", async () => {
    const result = await resolveLiveAttachUrl({
      job: { ...baseJob, attachUrl: "http://legacy:4096" } as Job,
      run: { session: "ses_x" } as JobRunSpec,
      executionPolicy: "prefer-live-server",
      discover: async () => undefined,
    })
    expect(result.attachUrl).toBe("http://legacy:4096")
    expect(result.source).toBe("job")
  })

  test("no attachUrl + sessionId + candidate found → source='registry'", async () => {
    const result = await resolveLiveAttachUrl({
      job: baseJob,
      run: { session: "ses_x" } as JobRunSpec,
      executionPolicy: "prefer-live-server",
      discover: async () => registryEntry({ url: "http://127.0.0.1:7777/" }),
    })
    expect(result).toEqual({ attachUrl: "http://127.0.0.1:7777/", source: "registry" })
  })

  test("no attachUrl + sessionId + no candidate → source='none', no fallback URL", async () => {
    const result = await resolveLiveAttachUrl({
      job: baseJob,
      run: { session: "ses_x" } as JobRunSpec,
      executionPolicy: "prefer-live-server",
      discover: async () => undefined,
    })
    expect(result).toEqual({ attachUrl: undefined, source: "none" })
  })

  test("headless-only suppresses discovery entirely", async () => {
    let discoverCalled = false
    const result = await resolveLiveAttachUrl({
      job: baseJob,
      run: { session: "ses_x" } as JobRunSpec,
      executionPolicy: "headless-only",
      discover: async () => {
        discoverCalled = true
        return registryEntry()
      },
    })
    expect(result.source).toBe("none")
    expect(discoverCalled).toBe(false)
  })

  test("missing run.session suppresses discovery (would land in a fresh session anyway)", async () => {
    let discoverCalled = false
    const result = await resolveLiveAttachUrl({
      job: baseJob,
      run: {} as JobRunSpec,
      executionPolicy: "prefer-live-server",
      discover: async () => {
        discoverCalled = true
        return registryEntry()
      },
    })
    expect(result.source).toBe("none")
    expect(discoverCalled).toBe(false)
  })

  test("discoverer throws → fallback to source='none' (best-effort)", async () => {
    const result = await resolveLiveAttachUrl({
      job: baseJob,
      run: { session: "ses_x" } as JobRunSpec,
      executionPolicy: "prefer-live-server",
      discover: async () => {
        throw new Error("ENOENT")
      },
    })
    expect(result.source).toBe("none")
  })

  test("workdir from job is forwarded to the discoverer for affinity sort", async () => {
    let receivedWorkdir: string | undefined
    await resolveLiveAttachUrl({
      job: { ...baseJob, workdir: "/specific/proj" } as Job,
      run: { session: "ses_x" } as JobRunSpec,
      executionPolicy: "prefer-live-server",
      discover: async (opts) => {
        receivedWorkdir = opts.workdir
        return undefined
      },
    })
    expect(receivedWorkdir).toBe("/specific/proj")
  })
})
