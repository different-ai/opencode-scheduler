/**
 * opencode-scheduler runner — fire-time helper for live HTTP delivery.
 *
 * Invoked by `supervisor.pl` (or any backend) like:
 *
 *   runner --job <path/to/job.json> [--timeout-seconds N]
 *
 * The runner only attempts live HTTP delivery. The supervisor decides
 * whether to invoke the runner at all (it skips when
 * executionPolicy='headless-only' or attachUrl is missing) and falls
 * back to the headless `opencode run` invocation on exit 10.
 *
 * Exit codes:
 *   0  — live delivery succeeded
 *  10  — live delivery failed (no server / timeout / non-2xx). Supervisor
 *        should fall back to the headless invocation.
 *  11  — validation/contract error (e.g. session 404). Do NOT retry.
 *  64  — usage error (bad CLI args / unreadable job).
 *
 * Each attempt appends a JSONL record to:
 *   ~/.config/opencode/scheduler/scopes/<scope>/runs/<slug>.jsonl
 */

import { appendFileSync, chmodSync, existsSync, mkdirSync, readFileSync } from "fs"
import { dirname, join } from "path"
import { homedir } from "os"

import { discoverLiveOpencode, fetchWithTimeout } from "./registry"

interface RunnerArgs {
  jobPath: string
  timeoutSeconds?: number
}

interface JobInvocation {
  command: string
  args: string[]
}

interface JobRunSpec {
  prompt?: string
  command?: string
  arguments?: string
  files?: string[]
  agent?: string
  attachUrl?: string
  session?: string
}

interface Job {
  scopeId?: string
  slug: string
  name: string
  workdir?: string
  run?: JobRunSpec
  prompt?: string
  attachUrl?: string
  sessionPolicy?: "current" | "existing" | "new-per-job" | "new-per-run"
  executionPolicy?: "prefer-live-server" | "headless-only"
  deliveryPolicy?: "execute" | "leave-message"
  invocation?: JobInvocation
  headlessInvocation?: JobInvocation
  timeoutSeconds?: number
}

interface RunRecord {
  runId: string
  timestamp: string
  delivery: "live" | "headless"
  attachUrl?: string
  /**
   * Where the runner got `attachUrl` from. `"job"` = persisted at
   * schedule-time (explicit arg or F2b serverUrl auto-promote);
   * `"registry"` = discovered from F5 plugin-side runtime registry
   * at fire-time. Helps when post-mortem'ing a delivery that landed
   * in an unexpected opencode instance.
   */
  attachUrlSource?: "job" | "registry"
  sessionId?: string
  httpStatus?: number
  error?: string
  durationMs: number
  exitCode: number
}

const SCHEDULED_PERMS: ReadonlyArray<{ permission: string; action: "deny"; pattern: string }> = [
  { permission: "question", action: "deny", pattern: "*" },
  { permission: "plan_enter", action: "deny", pattern: "*" },
  { permission: "plan_exit", action: "deny", pattern: "*" },
]

function parseArgs(argv: string[]): RunnerArgs {
  let jobPath = ""
  let timeoutSeconds: number | undefined
  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i]
    if (arg === "--job") {
      jobPath = argv[i + 1] ?? ""
      i += 1
    } else if (arg === "--timeout-seconds") {
      const value = parseInt(argv[i + 1] ?? "", 10)
      if (Number.isFinite(value) && value >= 0) timeoutSeconds = value
      i += 1
    }
  }
  if (!jobPath) {
    throw new Error("usage: runner --job <path/to/job.json> [--timeout-seconds N]")
  }
  return { jobPath, timeoutSeconds }
}

function readJob(jobPath: string): Job {
  const raw = readFileSync(jobPath, "utf-8")
  return JSON.parse(raw) as Job
}

function getJobRun(job: Job): JobRunSpec {
  if (job.run) return job.run
  return { prompt: job.prompt, attachUrl: job.attachUrl }
}

function runsJsonlPath(job: Job): string {
  const scope = job.scopeId ?? "default"
  const dir = join(homedir(), ".config", "opencode", "scheduler", "scopes", scope, "runs")
  return join(dir, `${job.slug}.jsonl`)
}

function appendRunRecord(job: Job, record: RunRecord): void {
  const path = runsJsonlPath(job)
  const dir = dirname(path)
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
    try {
      chmodSync(dir, 0o700)
    } catch {}
  }
  const isNew = !existsSync(path)
  appendFileSync(path, JSON.stringify(record) + "\n")
  if (isNew) {
    try {
      chmodSync(path, 0o600)
    } catch {}
  }
}

function newRunId(): string {
  const seconds = Math.floor(Date.now() / 1000)
  const random = Math.floor(Math.random() * 1_000_000_000).toString().padStart(9, "0")
  return `${seconds}-${random}`
}

function trimBaseUrl(url: string): string {
  return url.replace(/\/+$/, "")
}

interface SessionStatusMap {
  [sessionId: string]: { status?: string } | undefined
}

async function getSessionBusy(baseUrl: string, sessionId: string): Promise<boolean> {
  try {
    const res = await fetchWithTimeout(`${baseUrl}/session/status`, { method: "GET" }, 1500)
    if (!res.ok) return false
    const data = (await res.json().catch(() => ({}))) as SessionStatusMap
    // Idle sessions are removed from the map; presence implies non-idle.
    return Boolean(data[sessionId])
  } catch {
    return false
  }
}

async function pollUntilIdle(input: {
  baseUrl: string
  sessionId: string
  timeoutSeconds: number
  intervalMs: number
}): Promise<boolean> {
  const deadline = Date.now() + input.timeoutSeconds * 1000
  while (Date.now() < deadline) {
    const busy = await getSessionBusy(input.baseUrl, input.sessionId)
    if (!busy) return true
    await new Promise((r) => setTimeout(r, input.intervalMs))
  }
  return false
}

async function ensureLiveSession(input: {
  baseUrl: string
  job: Job
  existingSessionId?: string
}): Promise<{ sessionId: string; created: boolean }> {
  if (input.existingSessionId) {
    return { sessionId: input.existingSessionId, created: false }
  }
  // new-per-run path: create a fresh session per fire.
  const res = await fetchWithTimeout(
    `${input.baseUrl}/session`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: input.job.name, permission: SCHEDULED_PERMS }),
    },
    5000
  )
  if (!res.ok) {
    throw new Error(`POST /session failed: ${res.status} ${res.statusText}`)
  }
  const json = (await res.json().catch(() => null)) as { id?: string } | null
  if (!json?.id) throw new Error("POST /session returned no id")
  return { sessionId: json.id, created: true }
}

async function deliverLive(input: {
  baseUrl: string
  sessionId: string
  prompt: string
  files: string[]
  noReply: boolean
}): Promise<{ httpStatus: number }> {
  const parts: Array<{ type: "text"; text: string } | { type: "file"; mime?: string; url?: string }> = [
    { type: "text", text: input.prompt },
  ]
  // Files are referenced by path; opencode resolves them.
  for (const file of input.files) {
    parts.push({ type: "file", url: file })
  }
  const res = await fetchWithTimeout(
    `${input.baseUrl}/session/${encodeURIComponent(input.sessionId)}/prompt_async`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ noReply: input.noReply, parts }),
    },
    10000
  )
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`prompt_async ${res.status}: ${body}`.trim())
  }
  return { httpStatus: res.status }
}

async function bestEffortTuiHints(baseUrl: string, sessionId: string, message: string): Promise<void> {
  // Both calls swallow errors — they're nice-to-haves.
  try {
    await fetchWithTimeout(
      `${baseUrl}/tui/select-session`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionID: sessionId }),
      },
      1500
    )
  } catch {}
  try {
    await fetchWithTimeout(
      `${baseUrl}/tui/show-toast`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, variant: "info" }),
      },
      1500
    )
  } catch {}
}

async function preflight(input: { baseUrl: string; sessionId?: string }): Promise<"ok" | "no-server" | "no-session"> {
  try {
    const health = await fetchWithTimeout(`${input.baseUrl}/global/health`, { method: "GET" }, 1500)
    if (!health.ok) return "no-server"
  } catch {
    return "no-server"
  }
  if (input.sessionId) {
    try {
      const ses = await fetchWithTimeout(
        `${input.baseUrl}/session/${encodeURIComponent(input.sessionId)}`,
        { method: "GET" },
        1500
      )
      if (ses.status === 404) return "no-session"
      if (!ses.ok) return "no-server"
    } catch {
      return "no-server"
    }
  }
  return "ok"
}

async function runLive(input: {
  job: Job
  attachUrl: string
  attachUrlSource?: "job" | "registry"
  sessionId?: string
  prompt: string
  files: string[]
  deliveryPolicy: "execute" | "leave-message"
  timeoutSeconds: number
}): Promise<{ exitCode: number; record: RunRecord }> {
  const baseUrl = trimBaseUrl(input.attachUrl)
  const t0 = Date.now()
  const runId = newRunId()
  const timestamp = new Date().toISOString()
  const attachUrlSource = input.attachUrlSource ?? "job"

  const pre = await preflight({ baseUrl, sessionId: input.sessionId })
  if (pre === "no-server") {
    return {
      exitCode: 10,
      record: {
        runId,
        timestamp,
        delivery: "live",
        attachUrl: baseUrl,
        attachUrlSource,
        sessionId: input.sessionId,
        error: "preflight: server unreachable",
        durationMs: Date.now() - t0,
        exitCode: 10,
      },
    }
  }
  if (pre === "no-session") {
    return {
      exitCode: 11,
      record: {
        runId,
        timestamp,
        delivery: "live",
        attachUrl: baseUrl,
        attachUrlSource,
        sessionId: input.sessionId,
        error: "preflight: session not found",
        durationMs: Date.now() - t0,
        exitCode: 11,
      },
    }
  }

  let { sessionId } = await ensureLiveSession({
    baseUrl,
    job: input.job,
    existingSessionId: input.sessionId,
  })

  // Busy handling.
  if (input.deliveryPolicy === "execute") {
    const idleNow = !(await getSessionBusy(baseUrl, sessionId))
    if (!idleNow) {
      const becameIdle = await pollUntilIdle({
        baseUrl,
        sessionId,
        timeoutSeconds: input.timeoutSeconds,
        intervalMs: 2000,
      })
      if (!becameIdle) {
        return {
          exitCode: 10,
          record: {
            runId,
            timestamp,
            delivery: "live",
            attachUrl: baseUrl,
            attachUrlSource,
            sessionId,
            error: "session busy beyond timeout",
            durationMs: Date.now() - t0,
            exitCode: 10,
          },
        }
      }
    }
  }

  const noReply = input.deliveryPolicy === "leave-message"
  try {
    const { httpStatus } = await deliverLive({
      baseUrl,
      sessionId,
      prompt: input.prompt,
      files: input.files,
      noReply,
    })
    await bestEffortTuiHints(baseUrl, sessionId, `Scheduled: ${input.job.name}`)
    return {
      exitCode: 0,
      record: {
        runId,
        timestamp,
        delivery: "live",
        attachUrl: baseUrl,
        attachUrlSource,
        sessionId,
        httpStatus,
        durationMs: Date.now() - t0,
        exitCode: 0,
      },
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    return {
      exitCode: 10,
      record: {
        runId,
        timestamp,
        delivery: "live",
        attachUrl: baseUrl,
        attachUrlSource,
        sessionId,
        error: msg,
        durationMs: Date.now() - t0,
        exitCode: 10,
      },
    }
  }
}

/**
 * Decide where the runner should deliver the prompt.
 *
 *   1. If the job persisted an `attachUrl` at schedule-time (explicit
 *      arg or F2b serverUrl auto-promote), use it as-is — the user
 *      asked for that target.
 *   2. Otherwise, when `sessionPolicy` resolved to a known sessionId
 *      AND `executionPolicy !== 'headless-only'`, ask the F5 runtime
 *      registry which live opencode currently sees this session.
 *      `discoverLiveOpencode` does the alive + reachable + workdir-
 *      affinity sort and returns the best candidate (or undefined).
 *   3. When neither path produces a URL, the caller short-circuits to
 *      exit 10 and `supervisor.pl` falls back to the headless
 *      invocation.
 *
 * Pulled out of `main()` so the discovery glue is unit-testable
 * without spinning up the runner CLI / fs.
 */
export async function resolveLiveAttachUrl(input: {
  job: Job
  run: JobRunSpec
  executionPolicy: "prefer-live-server" | "headless-only"
  discover?: typeof discoverLiveOpencode
}): Promise<{ attachUrl?: string; source: "job" | "registry" | "none" }> {
  const direct = input.run.attachUrl ?? input.job.attachUrl
  if (direct) return { attachUrl: direct, source: "job" }

  if (input.executionPolicy === "headless-only" || !input.run.session) {
    return { attachUrl: undefined, source: "none" }
  }

  const discover = input.discover ?? discoverLiveOpencode
  try {
    const candidate = await discover({
      sessionId: input.run.session,
      workdir: input.job.workdir,
    })
    if (candidate) return { attachUrl: candidate.url, source: "registry" }
  } catch {
    // discovery is best-effort; treat as no candidate
  }
  return { attachUrl: undefined, source: "none" }
}

async function main(): Promise<number> {
  let args: RunnerArgs
  try {
    args = parseArgs(process.argv.slice(2))
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    process.stderr.write(`runner: ${msg}\n`)
    return 64
  }

  let job: Job
  try {
    job = readJob(args.jobPath)
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error)
    process.stderr.write(`runner: failed to read job: ${msg}\n`)
    return 64
  }

  const run = getJobRun(job)
  const executionPolicy = job.executionPolicy ?? "prefer-live-server"
  const deliveryPolicy = job.deliveryPolicy ?? "execute"
  const timeoutSeconds = args.timeoutSeconds ?? job.timeoutSeconds ?? 60

  const resolved = await resolveLiveAttachUrl({ job, run, executionPolicy })
  const attachUrl = resolved.attachUrl

  // S5 step 0: short-circuit when live delivery is impossible.
  if (!attachUrl || executionPolicy === "headless-only") {
    const record: RunRecord = {
      runId: newRunId(),
      timestamp: new Date().toISOString(),
      delivery: "live",
      attachUrl: attachUrl ? trimBaseUrl(attachUrl) : undefined,
      sessionId: run.session,
      error: !attachUrl
        ? "no attachUrl on job; live delivery impossible (F5 discovery found no live opencode that sees this session)"
        : "executionPolicy='headless-only'",
      durationMs: 0,
      exitCode: 10,
    }
    appendRunRecord(job, record)
    return 10
  }

  const prompt = (run.prompt ?? "").trim()
  if (!prompt) {
    const record: RunRecord = {
      runId: newRunId(),
      timestamp: new Date().toISOString(),
      delivery: "live",
      attachUrl: trimBaseUrl(attachUrl),
      sessionId: run.session,
      error: "job has no prompt; runner only handles prompt-mode delivery",
      durationMs: 0,
      exitCode: 11,
    }
    appendRunRecord(job, record)
    return 11
  }

  // `resolved.source` is guaranteed 'job' | 'registry' here — the
  // 'none' branch already short-circuited above.
  const attachUrlSource: "job" | "registry" = resolved.source === "registry" ? "registry" : "job"

  const result = await runLive({
    job,
    attachUrl,
    attachUrlSource,
    sessionId: run.session,
    prompt,
    files: run.files ?? [],
    deliveryPolicy,
    timeoutSeconds,
  })
  appendRunRecord(job, result.record)
  return result.exitCode
}

// Run only when invoked directly. Allows the file to be imported by tests
// without triggering main().
const invokedDirectly = (() => {
  const arg1 = process.argv[1] ?? ""
  return arg1.endsWith("runner.js") || arg1.endsWith("runner.ts")
})()

if (invokedDirectly) {
  main().then(
    (code) => process.exit(code),
    (error) => {
      const msg = error instanceof Error ? error.message : String(error)
      process.stderr.write(`runner: unhandled error: ${msg}\n`)
      process.exit(10)
    }
  )
}

// Re-exports for tests.
export {
  parseArgs,
  preflight,
  pollUntilIdle,
  getSessionBusy,
  deliverLive,
  ensureLiveSession,
  runLive,
  trimBaseUrl,
  newRunId,
  SCHEDULED_PERMS,
}
export type { Job, JobInvocation, JobRunSpec, RunRecord, RunnerArgs }
