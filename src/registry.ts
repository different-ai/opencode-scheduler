/**
 * F5 — plugin-side runtime registry.
 *
 * Each opencode process running this plugin writes a JSON entry under
 * `~/.local/share/opencode/runtime/<pid>.json` describing where it can
 * be reached. Other tools (notably the scheduler runner at fire-time)
 * read the directory to discover live opencode instances when no
 * `attachUrl` was supplied at schedule-time.
 *
 * Why plugin-side: storage gives no session→process linkage
 * (`opencode-fork/packages/opencode/src/session/session.sql.ts` has
 * `id, project_id, parent_id, slug, directory, title, ...` — no
 * `attached_pid` / `bound_port`). The plugin already runs in every
 * opencode process and knows its own `serverUrl`, so it can write the
 * missing linkage itself without an upstream feature.
 *
 * Tri-mode contract (see plan F5):
 *   1. internal serverUrl (`http://opencode.internal/...`) — skip write,
 *      entry would be useless externally;
 *   2. external `--port N` / `--port 0` — write entry, runner discovers;
 *   3. `server.port: 0` in opencode.json (after F7 lands) — same as 2.
 */

import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, unlinkSync, writeFileSync } from "fs"
import { homedir } from "os"
import { join } from "path"

export const REGISTRY_SCHEMA_VERSION = 1

/**
 * Shape of one `<pid>.json` file. `schemaVersion` is stored verbatim
 * so a future incompatible bump can be detected with one numeric
 * comparison; readers MUST skip entries whose version does not equal
 * {@link REGISTRY_SCHEMA_VERSION} and stay backwards-tolerant on
 * unknown / missing keys.
 */
export interface RegistryEntry {
  schemaVersion: typeof REGISTRY_SCHEMA_VERSION
  pid: number
  port: number
  url: string
  workdir: string
  startedAt: string
  agent?: "tui" | "headless"
}

/**
 * Resolve the registry directory. Honours
 * `OPENCODE_SCHEDULER_RUNTIME_DIR` so unit tests can point at a tmp
 * directory without touching the user's real home.
 */
export function getRuntimeDir(): string {
  return process.env.OPENCODE_SCHEDULER_RUNTIME_DIR ?? join(homedir(), ".local", "share", "opencode", "runtime")
}

function entryPath(dir: string, pid: number): string {
  return join(dir, `${pid}.json`)
}

/**
 * Write the calling process's registry entry atomically. On the same
 * filesystem `rename(2)` is atomic, so other readers will see either
 * the previous file or the new one — never a torn write.
 */
export function writeRegistryEntry(entry: RegistryEntry, dir: string = getRuntimeDir()): string {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true, mode: 0o700 })
  const finalPath = entryPath(dir, entry.pid)
  const tmpPath = `${finalPath}.tmp.${process.pid}.${Date.now()}`
  writeFileSync(tmpPath, JSON.stringify(entry), { mode: 0o600 })
  renameSync(tmpPath, finalPath)
  return finalPath
}

/**
 * Best-effort delete. Used both during normal shutdown (own pid) and
 * during stale sweeps (other dead pids). Errors are intentionally
 * swallowed — the next sweep will retry.
 */
export function removeRegistryEntry(pid: number, dir: string = getRuntimeDir()): void {
  try {
    unlinkSync(entryPath(dir, pid))
  } catch {
    // already gone or permission denied — next sweep will handle it
  }
}

/**
 * `kill(pid, 0)` is the POSIX idiom for liveness probing — sends no
 * signal, just resolves the pid. ESRCH = no such process. EPERM = the
 * process exists but we don't have permission to signal it (rare on a
 * single-user macOS / Linux box, but treat it as "alive" so we don't
 * delete entries owned by another user's opencode).
 */
export function isPidAlive(pid: number): boolean {
  try {
    process.kill(pid, 0)
    return true
  } catch (err) {
    const code = (err as NodeJS.ErrnoException).code
    return code === "EPERM"
  }
}

/**
 * Parse a single `<pid>.json` file. Returns `null` when the file is
 * unreadable, not parseable as JSON, or has a `schemaVersion` we don't
 * understand — so callers can sweep / skip entries without try/catch
 * everywhere.
 */
export function readRegistryEntry(path: string): RegistryEntry | null {
  try {
    const raw = readFileSync(path, "utf-8")
    const parsed = JSON.parse(raw)
    if (
      parsed &&
      typeof parsed === "object" &&
      parsed.schemaVersion === REGISTRY_SCHEMA_VERSION &&
      typeof parsed.pid === "number" &&
      typeof parsed.port === "number" &&
      typeof parsed.url === "string" &&
      typeof parsed.workdir === "string" &&
      typeof parsed.startedAt === "string"
    ) {
      return parsed as RegistryEntry
    }
    return null
  } catch {
    return null
  }
}

/**
 * Read every parseable entry from the registry directory. Bad files
 * (corrupt JSON, wrong schemaVersion) are silently skipped — they
 * become candidates for the stale sweep next.
 */
export function listRegistryEntries(dir: string = getRuntimeDir()): RegistryEntry[] {
  if (!existsSync(dir)) return []
  return readdirSync(dir)
    .filter((file) => file.endsWith(".json") && !file.endsWith(".tmp.json"))
    .map((file) => readRegistryEntry(join(dir, file)))
    .filter((entry): entry is RegistryEntry => entry !== null)
}

/**
 * Cheap O(N) sweep over the registry directory. Removes entries
 * whose pid is no longer alive AND entries whose JSON is unparseable
 * / has the wrong schemaVersion. Intended to run on every plugin
 * init so directories stay bounded even if opencode processes
 * crash without unlinking their own entry.
 */
export function sweepStaleEntries(dir: string = getRuntimeDir()): { scanned: number; removed: number } {
  if (!existsSync(dir)) return { scanned: 0, removed: 0 }
  const files = readdirSync(dir).filter((file) => file.endsWith(".json") && !file.endsWith(".tmp.json"))
  let removed = 0
  for (const file of files) {
    const path = join(dir, file)
    const entry = readRegistryEntry(path)
    const dead = !entry || !isPidAlive(entry.pid)
    if (dead) {
      try {
        unlinkSync(path)
        removed += 1
      } catch {
        // permission denied or race — leave it for next sweep
      }
    }
  }
  return { scanned: files.length, removed }
}

/**
 * Tiny `fetch` wrapper with a hard timeout. Exported so the runner
 * (which already needs the same primitive for its preflight calls)
 * doesn't carry its own duplicate.
 */
export async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
  fetchImpl: typeof fetch = fetch,
): Promise<Response> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)
  try {
    return await fetchImpl(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(id)
  }
}

/**
 * Pick the best live opencode for delivering into `sessionId`:
 *
 *   1. drop entries whose pid is dead (cheap local check),
 *   2. ask each candidate `GET /session/<sid>` — only those that
 *      respond 200 are kept (proves the candidate is reachable AND
 *      sees the session in shared SQLite),
 *   3. sort by `startedAt` desc — long-running TUI naturally outranks
 *      ephemeral headless processes,
 *   4. lightweight workdir affinity — when `workdir` is supplied,
 *      prefer entries whose `workdir` matches exactly.
 *
 * Returns `undefined` when nothing matches; the caller falls back to
 * the headless `opencode run` path.
 */
export async function discoverLiveOpencode(opts: {
  sessionId: string
  workdir?: string
  dir?: string
  fetchImpl?: typeof fetch
  perCandidateTimeoutMs?: number
}): Promise<RegistryEntry | undefined> {
  const dir = opts.dir ?? getRuntimeDir()
  const fetchImpl = opts.fetchImpl ?? fetch
  const timeoutMs = opts.perCandidateTimeoutMs ?? 1500

  const aliveCandidates = listRegistryEntries(dir).filter((entry) => isPidAlive(entry.pid))
  if (aliveCandidates.length === 0) return undefined

  // Sort by startedAt desc; workdir affinity layered on top so
  // matching workdir wins over fresher pid only when both are alive
  // and reachable.
  aliveCandidates.sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1))
  if (opts.workdir) {
    const target = opts.workdir
    aliveCandidates.sort((a, b) => {
      const aMatch = a.workdir === target ? 0 : 1
      const bMatch = b.workdir === target ? 0 : 1
      return aMatch - bMatch
    })
  }

  for (const candidate of aliveCandidates) {
    const baseUrl = candidate.url.replace(/\/+$/, "")
    const probeUrl = `${baseUrl}/session/${encodeURIComponent(opts.sessionId)}`
    try {
      const res = await fetchWithTimeout(probeUrl, { method: "GET" }, timeoutMs, fetchImpl)
      if (res.ok) return candidate
    } catch {
      // unreachable / aborted — move on
    }
  }
  return undefined
}
