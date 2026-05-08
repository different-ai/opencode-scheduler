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
export declare const REGISTRY_SCHEMA_VERSION = 1;
/**
 * Shape of one `<pid>.json` file. `schemaVersion` is stored verbatim
 * so a future incompatible bump can be detected with one numeric
 * comparison; readers MUST skip entries whose version does not equal
 * {@link REGISTRY_SCHEMA_VERSION} and stay backwards-tolerant on
 * unknown / missing keys.
 */
export interface RegistryEntry {
    schemaVersion: typeof REGISTRY_SCHEMA_VERSION;
    pid: number;
    port: number;
    url: string;
    workdir: string;
    startedAt: string;
    agent?: "tui" | "headless";
}
/**
 * Resolve the registry directory. Honours
 * `OPENCODE_SCHEDULER_RUNTIME_DIR` so unit tests can point at a tmp
 * directory without touching the user's real home.
 */
export declare function getRuntimeDir(): string;
/**
 * Write the calling process's registry entry atomically. On the same
 * filesystem `rename(2)` is atomic, so other readers will see either
 * the previous file or the new one — never a torn write.
 */
export declare function writeRegistryEntry(entry: RegistryEntry, dir?: string): string;
/**
 * Best-effort delete. Used both during normal shutdown (own pid) and
 * during stale sweeps (other dead pids). Errors are intentionally
 * swallowed — the next sweep will retry.
 */
export declare function removeRegistryEntry(pid: number, dir?: string): void;
/**
 * `kill(pid, 0)` is the POSIX idiom for liveness probing — sends no
 * signal, just resolves the pid. ESRCH = no such process. EPERM = the
 * process exists but we don't have permission to signal it (rare on a
 * single-user macOS / Linux box, but treat it as "alive" so we don't
 * delete entries owned by another user's opencode).
 */
export declare function isPidAlive(pid: number): boolean;
/**
 * Parse a single `<pid>.json` file. Returns `null` when the file is
 * unreadable, not parseable as JSON, or has a `schemaVersion` we don't
 * understand — so callers can sweep / skip entries without try/catch
 * everywhere.
 */
export declare function readRegistryEntry(path: string): RegistryEntry | null;
/**
 * Read every parseable entry from the registry directory. Bad files
 * (corrupt JSON, wrong schemaVersion) are silently skipped — they
 * become candidates for the stale sweep next.
 */
export declare function listRegistryEntries(dir?: string): RegistryEntry[];
/**
 * Cheap O(N) sweep over the registry directory. Removes entries
 * whose pid is no longer alive AND entries whose JSON is unparseable
 * / has the wrong schemaVersion. Intended to run on every plugin
 * init so directories stay bounded even if opencode processes
 * crash without unlinking their own entry.
 */
export declare function sweepStaleEntries(dir?: string): {
    scanned: number;
    removed: number;
};
/**
 * Tiny `fetch` wrapper with a hard timeout. Exported so the runner
 * (which already needs the same primitive for its preflight calls)
 * doesn't carry its own duplicate.
 */
export declare function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number, fetchImpl?: typeof fetch): Promise<Response>;
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
export declare function discoverLiveOpencode(opts: {
    sessionId: string;
    workdir?: string;
    dir?: string;
    fetchImpl?: typeof fetch;
    perCandidateTimeoutMs?: number;
}): Promise<RegistryEntry | undefined>;
