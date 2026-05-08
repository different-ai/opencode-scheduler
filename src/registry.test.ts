import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { join } from "path"
import { buildOwnRegistryEntry, initRegistryForPlugin } from "./index"
import {
  REGISTRY_SCHEMA_VERSION,
  discoverLiveOpencode,
  fetchWithTimeout,
  getRuntimeDir,
  isPidAlive,
  listRegistryEntries,
  readRegistryEntry,
  removeRegistryEntry,
  sweepStaleEntries,
  writeRegistryEntry,
  type RegistryEntry,
} from "./registry"

let dir: string

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "scheduler-registry-"))
})

afterEach(() => {
  try {
    rmSync(dir, { recursive: true, force: true })
  } catch {}
  delete process.env.OPENCODE_SCHEDULER_RUNTIME_DIR
})

const liveEntry = (overrides: Partial<RegistryEntry> = {}): RegistryEntry => ({
  schemaVersion: REGISTRY_SCHEMA_VERSION,
  pid: process.pid, // any check is via process.kill(_, 0); using own pid keeps the process "alive" for tests
  port: 4096,
  url: "http://127.0.0.1:4096/",
  workdir: "/Users/me/proj",
  startedAt: new Date().toISOString(),
  agent: "tui",
  ...overrides,
})

describe("getRuntimeDir", () => {
  test("defaults to ~/.local/share/opencode/runtime", () => {
    const value = getRuntimeDir()
    expect(value).toMatch(/\.local\/share\/opencode\/runtime$/)
  })

  test("honours OPENCODE_SCHEDULER_RUNTIME_DIR for tests", () => {
    process.env.OPENCODE_SCHEDULER_RUNTIME_DIR = "/tmp/scheduler-test-runtime"
    expect(getRuntimeDir()).toBe("/tmp/scheduler-test-runtime")
  })
})

describe("writeRegistryEntry / readRegistryEntry", () => {
  test("round-trips a valid entry", () => {
    const entry = liveEntry({ pid: 9999, port: 4097 })
    const path = writeRegistryEntry(entry, dir)
    const round = readRegistryEntry(path)
    expect(round).toEqual(entry)
  })

  test("creates the directory if missing (mode 0700)", () => {
    const nested = join(dir, "deep", "runtime")
    const entry = liveEntry({ pid: 8888 })
    writeRegistryEntry(entry, nested)
    expect(readRegistryEntry(join(nested, "8888.json"))).toEqual(entry)
  })

  test("write is atomic — no .tmp leftovers visible to a reader", () => {
    writeRegistryEntry(liveEntry({ pid: 7777 }), dir)
    const visible = listRegistryEntries(dir)
    expect(visible.length).toBe(1)
  })

  test("readRegistryEntry returns null on garbage JSON", () => {
    const path = join(dir, "1234.json")
    writeFileSync(path, "{not json")
    expect(readRegistryEntry(path)).toBeNull()
  })

  test("readRegistryEntry returns null on wrong schemaVersion", () => {
    const path = join(dir, "1234.json")
    writeFileSync(path, JSON.stringify({ ...liveEntry({ pid: 1234 }), schemaVersion: 99 }))
    expect(readRegistryEntry(path)).toBeNull()
  })

  test("readRegistryEntry returns null on missing required fields", () => {
    const path = join(dir, "1234.json")
    writeFileSync(path, JSON.stringify({ schemaVersion: 1, pid: 1234 })) // no url/port/etc
    expect(readRegistryEntry(path)).toBeNull()
  })
})

describe("removeRegistryEntry", () => {
  test("removes the file", () => {
    writeRegistryEntry(liveEntry({ pid: 6666 }), dir)
    removeRegistryEntry(6666, dir)
    expect(listRegistryEntries(dir)).toEqual([])
  })

  test("is a no-op when the file does not exist", () => {
    expect(() => removeRegistryEntry(99999, dir)).not.toThrow()
  })
})

describe("isPidAlive", () => {
  test("own pid is alive", () => {
    expect(isPidAlive(process.pid)).toBe(true)
  })

  test("a synthetic high pid is dead (very unlikely to clash on a test box)", () => {
    // 2^22 - 1 — well above macOS / Linux default ranges; if this
    // ever flakes, the box has issued > 4M pids since boot which is
    // its own kind of bug. Keep the test value high enough that
    // assignment-races don't matter.
    expect(isPidAlive(4194303)).toBe(false)
  })
})

describe("listRegistryEntries", () => {
  test("returns [] for a missing directory", () => {
    expect(listRegistryEntries(join(dir, "does-not-exist"))).toEqual([])
  })

  test("skips files that are not .json", () => {
    writeFileSync(join(dir, "README"), "ignored")
    writeFileSync(join(dir, "1234.json.tmp"), "ignored")
    writeRegistryEntry(liveEntry({ pid: 5555 }), dir)
    const entries = listRegistryEntries(dir)
    expect(entries.length).toBe(1)
    expect(entries[0].pid).toBe(5555)
  })

  test("skips parse-failures rather than throwing", () => {
    writeRegistryEntry(liveEntry({ pid: 4444 }), dir)
    writeFileSync(join(dir, "broken.json"), "not json")
    const entries = listRegistryEntries(dir)
    expect(entries.length).toBe(1)
    expect(entries[0].pid).toBe(4444)
  })
})

describe("sweepStaleEntries", () => {
  test("removes entries whose pid is dead", () => {
    writeRegistryEntry(liveEntry({ pid: 4194301 }), dir) // dead
    writeRegistryEntry(liveEntry({ pid: process.pid }), dir) // alive
    const result = sweepStaleEntries(dir)
    expect(result.scanned).toBe(2)
    expect(result.removed).toBe(1)
    expect(listRegistryEntries(dir).map((e) => e.pid)).toEqual([process.pid])
  })

  test("removes corrupt JSON files (no recoverable pid → counts as dead)", () => {
    writeFileSync(join(dir, "broken.json"), "{not json")
    const result = sweepStaleEntries(dir)
    expect(result.removed).toBe(1)
  })

  test("removes entries with the wrong schemaVersion", () => {
    writeFileSync(join(dir, "1.json"), JSON.stringify({ schemaVersion: 99, pid: process.pid }))
    const result = sweepStaleEntries(dir)
    expect(result.removed).toBe(1)
  })

  test("returns zeros when the directory does not exist", () => {
    const result = sweepStaleEntries(join(dir, "missing"))
    expect(result).toEqual({ scanned: 0, removed: 0 })
  })
})

describe("buildOwnRegistryEntry", () => {
  test("returns undefined for the in-process IPC sentinel", () => {
    const entry = buildOwnRegistryEntry({
      serverUrl: new URL("http://opencode.internal/"),
      workdir: "/x",
    })
    expect(entry).toBeUndefined()
  })

  test("derives port from the URL for external serverUrl", () => {
    const entry = buildOwnRegistryEntry({
      serverUrl: new URL("http://127.0.0.1:5050/"),
      pid: 1234,
      workdir: "/x",
      startedAt: "2026-05-03T00:00:00.000Z",
      agent: "tui",
    })
    expect(entry).toEqual({
      schemaVersion: REGISTRY_SCHEMA_VERSION,
      pid: 1234,
      port: 5050,
      url: "http://127.0.0.1:5050/",
      workdir: "/x",
      startedAt: "2026-05-03T00:00:00.000Z",
      agent: "tui",
    })
  })

  test("defaults pid / workdir / startedAt when not given", () => {
    const entry = buildOwnRegistryEntry({
      serverUrl: "http://127.0.0.1:6000/",
    })
    expect(entry?.pid).toBe(process.pid)
    expect(entry?.port).toBe(6000)
    expect(entry?.workdir).toBe(process.cwd())
    expect(entry?.startedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })
})

describe("initRegistryForPlugin", () => {
  test("internal serverUrl: sweep runs, no entry written", () => {
    process.env.OPENCODE_SCHEDULER_RUNTIME_DIR = dir
    writeRegistryEntry(liveEntry({ pid: 4194302 }), dir) // stale
    const result = initRegistryForPlugin({
      serverUrl: "http://opencode.internal/",
      workdir: "/x",
    })
    expect(result.entry).toBeUndefined()
    expect(result.sweepRemoved).toBe(1)
    // Our own entry was NOT written.
    const entries = listRegistryEntries(dir)
    expect(entries.find((e) => e.pid === process.pid)).toBeUndefined()
  })

  test("external serverUrl: writes our entry AND sweeps stale ones", () => {
    process.env.OPENCODE_SCHEDULER_RUNTIME_DIR = dir
    writeRegistryEntry(liveEntry({ pid: 4194300 }), dir) // stale
    const result = initRegistryForPlugin({
      serverUrl: "http://127.0.0.1:7700/",
      workdir: "/x",
      registryDir: dir,
    })
    expect(result.entry?.pid).toBe(process.pid)
    expect(result.entry?.port).toBe(7700)
    expect(result.sweepRemoved).toBe(1)
    const written = readRegistryEntry(join(dir, `${process.pid}.json`))
    expect(written?.url).toBe("http://127.0.0.1:7700/")
  })
})

describe("discoverLiveOpencode", () => {
  test("returns undefined when registry is empty", async () => {
    const winner = await discoverLiveOpencode({ sessionId: "ses_x", dir })
    expect(winner).toBeUndefined()
  })

  test("returns undefined when no candidate sees the session (all 404)", async () => {
    writeRegistryEntry(liveEntry({ pid: process.pid, port: 7000, url: "http://127.0.0.1:7000/" }), dir)
    const fetchImpl = (async () => new Response("nope", { status: 404 })) as unknown as typeof fetch
    const winner = await discoverLiveOpencode({ sessionId: "ses_x", dir, fetchImpl })
    expect(winner).toBeUndefined()
  })

  test("returns the first candidate whose probe succeeds (200)", async () => {
    writeRegistryEntry(
      liveEntry({ pid: process.pid, port: 7001, url: "http://127.0.0.1:7001/", startedAt: "2026-05-03T10:00:00Z" }),
      dir,
    )
    const fetchImpl = (async () => new Response("{}", { status: 200 })) as unknown as typeof fetch
    const winner = await discoverLiveOpencode({ sessionId: "ses_x", dir, fetchImpl })
    expect(winner?.port).toBe(7001)
  })

  test("workdir affinity: matching workdir wins over a fresher pid", async () => {
    // Register two LIVE entries (both pids alive — use process.pid for
    // both, registry write keys by pid so we override; we want two
    // SEPARATE files to test ordering, so use two test pids that both
    // pass `kill -0` — process.pid + a fork is overkill. Use the
    // current pid and a synthetic alive sentinel: pids of init / launchd
    // (1) which is universally alive on macOS.)
    writeRegistryEntry(
      liveEntry({
        pid: process.pid,
        port: 8001,
        url: "http://127.0.0.1:8001/",
        workdir: "/other",
        startedAt: "2026-05-03T11:00:00Z", // newer
      }),
      dir,
    )
    writeRegistryEntry(
      liveEntry({
        pid: 1, // launchd / init — always alive on macOS / Linux
        port: 8002,
        url: "http://127.0.0.1:8002/",
        workdir: "/match",
        startedAt: "2026-05-03T09:00:00Z", // older
      }),
      dir,
    )
    let probedPort = 0
    const fetchImpl = (async (input: string | URL | Request) => {
      const u = new URL(typeof input === "string" ? input : input.toString())
      probedPort = Number.parseInt(u.port, 10)
      return new Response("{}", { status: 200 })
    }) as typeof fetch
    const winner = await discoverLiveOpencode({
      sessionId: "ses_x",
      workdir: "/match",
      dir,
      fetchImpl,
    })
    expect(winner?.workdir).toBe("/match")
    expect(probedPort).toBe(8002)
  })

  test("falls back to the next candidate when the first probe throws", async () => {
    writeRegistryEntry(
      liveEntry({
        pid: process.pid,
        port: 9001,
        url: "http://127.0.0.1:9001/",
        startedAt: "2026-05-03T11:00:00Z",
      }),
      dir,
    )
    writeRegistryEntry(
      liveEntry({
        pid: 1,
        port: 9002,
        url: "http://127.0.0.1:9002/",
        startedAt: "2026-05-03T09:00:00Z",
      }),
      dir,
    )
    const fetchImpl = (async (input: string | URL | Request) => {
      const u = new URL(typeof input === "string" ? input : input.toString())
      if (u.port === "9001") throw new Error("ECONNREFUSED")
      return new Response("{}", { status: 200 })
    }) as typeof fetch
    const winner = await discoverLiveOpencode({ sessionId: "ses_x", dir, fetchImpl })
    expect(winner?.port).toBe(9002)
  })

  test("dead pid is filtered out before any probe", async () => {
    writeRegistryEntry(liveEntry({ pid: 4194295, port: 9100, url: "http://127.0.0.1:9100/" }), dir)
    let probed = false
    const fetchImpl = (async () => {
      probed = true
      return new Response("{}", { status: 200 })
    }) as unknown as typeof fetch
    const winner = await discoverLiveOpencode({ sessionId: "ses_x", dir, fetchImpl })
    expect(probed).toBe(false)
    expect(winner).toBeUndefined()
  })
})

describe("fetchWithTimeout", () => {
  test("returns the response when fetchImpl resolves quickly", async () => {
    const fetchImpl = (async () => new Response("ok", { status: 200 })) as unknown as typeof fetch
    const res = await fetchWithTimeout("http://x/", { method: "GET" }, 100, fetchImpl)
    expect(res.status).toBe(200)
  })

  test("aborts when the timeout elapses", async () => {
    const fetchImpl = ((_url: unknown, init: RequestInit | undefined) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener("abort", () => reject(new Error("aborted")))
      })) as unknown as typeof fetch
    await expect(fetchWithTimeout("http://x/", { method: "GET" }, 5, fetchImpl)).rejects.toThrow(/aborted/)
  })
})
