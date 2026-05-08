/**
 * F6 — `install_server_config` helpers.
 *
 * Scope: write `server.port` (default 0) into the user's
 * `~/.config/opencode/opencode.json` so every opencode start picks a
 * TCP port and registers itself with the F5 plugin-side registry.
 * Strictly limited to that one config file — does NOT touch shell rc
 * files, environment, launchd plists, or anything else.
 *
 * Pure helpers live here so the tool body in `src/index.ts` is just
 * argument plumbing + result formatting.
 */

import { closeSync, existsSync, fsyncSync, mkdirSync, openSync, readFileSync, renameSync, writeSync } from "fs"
import { homedir } from "os"
import { dirname, join } from "path"

export const DEFAULT_OPENCODE_CONFIG_PATH = join(homedir(), ".config", "opencode", "opencode.json")

/**
 * Default `server.port` value F6 writes when the user doesn't pass
 * one explicitly. `0` matches the CLI `--port 0` shortcut: opencode
 * tries 4096, then falls back to OS-assigned random. Requires the
 * F7 upstream Zod fix (commit `477861e2b` in `opencode-fork`) to
 * pass schema validation; before that commit lands upstream, the
 * config file written here will be rejected at config-load time —
 * users on a pre-F7 opencode should pass an explicit positive port.
 */
export const DEFAULT_SERVER_PORT = 0

export type ServerConfigAction =
  | { kind: "noop"; reason: "port-already-matches" }
  | { kind: "add-server"; port: number }
  | { kind: "add-port"; port: number }
  | { kind: "overwrite-port"; previous: number; next: number }

export interface PlannedServerConfigUpdate {
  action: ServerConfigAction
  before: Record<string, unknown>
  after: Record<string, unknown>
  /** Human-readable summary of what changed (one line per change). */
  diff: string
}

/**
 * Read and parse the opencode JSON config. Returns `{}` when the
 * file does not exist (treated as "no config yet"). Throws on
 * unparseable JSON — better to surface the read error than to
 * silently overwrite a hand-edited file we can't understand.
 */
export function readOpencodeConfig(path: string = DEFAULT_OPENCODE_CONFIG_PATH): Record<string, unknown> {
  if (!existsSync(path)) return {}
  const raw = readFileSync(path, "utf-8")
  // Empty file is a common state right after `touch opencode.json`;
  // treat it as no config rather than throwing on the empty string.
  if (!raw.trim()) return {}
  const parsed = JSON.parse(raw)
  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`Config at ${path} is not a JSON object (got ${Array.isArray(parsed) ? "array" : typeof parsed}).`)
  }
  return parsed as Record<string, unknown>
}

/**
 * Compute what the F6 tool should do without writing anything. The
 * caller renders the result; on `overwrite-port` the tool MAY refuse
 * unless the user explicitly opted in via `overwrite: true`.
 *
 * Preserves every other top-level key (and every other key inside
 * `server`) so it's safe to run on a config the user has hand-edited.
 */
export function planServerConfigUpdate(
  current: Record<string, unknown>,
  desiredPort: number,
): PlannedServerConfigUpdate {
  const before = current
  const existingServer = current.server
  const serverIsObject = existingServer !== null && typeof existingServer === "object" && !Array.isArray(existingServer)

  // Case 1: no `server` block at all.
  if (!serverIsObject) {
    const after = { ...current, server: { port: desiredPort } }
    return {
      action: { kind: "add-server", port: desiredPort },
      before,
      after,
      diff: `+ server: { port: ${desiredPort} }`,
    }
  }

  const serverObj = existingServer as Record<string, unknown>
  const existingPortRaw = serverObj.port

  // Case 2: `server` exists but no `port`.
  if (existingPortRaw === undefined) {
    const after = { ...current, server: { ...serverObj, port: desiredPort } }
    return {
      action: { kind: "add-port", port: desiredPort },
      before,
      after,
      diff: `+ server.port: ${desiredPort}`,
    }
  }

  // Case 3: `server.port` already matches.
  if (existingPortRaw === desiredPort) {
    return {
      action: { kind: "noop", reason: "port-already-matches" },
      before,
      after: current,
      diff: `(no change — server.port is already ${desiredPort})`,
    }
  }

  // Case 4: `server.port` differs — overwrite (caller decides whether
  // to require explicit confirmation).
  if (typeof existingPortRaw !== "number") {
    throw new Error(`Existing server.port is not a number (${typeof existingPortRaw}); refuse to overwrite blindly.`)
  }
  const after = { ...current, server: { ...serverObj, port: desiredPort } }
  return {
    action: { kind: "overwrite-port", previous: existingPortRaw, next: desiredPort },
    before,
    after,
    diff: `~ server.port: ${existingPortRaw} → ${desiredPort}`,
  }
}

/**
 * Atomic JSON write following the plan's explicit recipe:
 *   1. serialize to a sibling temp file in the same directory (so
 *      `rename(2)` is atomic — same filesystem),
 *   2. fsync the temp file's data to disk BEFORE renaming, so a
 *      crash between rename and the next periodic flush can't leave
 *      the destination filename pointing at a zero-length inode,
 *   3. rename over the original (durable directory entry on most
 *      modern fs after a periodic commit; we also fsync the parent
 *      dir afterwards for ext4-style guarantees),
 *   4. read the file back and re-parse to guarantee we didn't write
 *      garbage that round-trips through the FS layer.
 *
 * `writeFileSync` alone returns once the data is in the kernel page
 * cache and is NOT enough to survive a power loss between the
 * rename and the next periodic flush.
 */
export function writeOpencodeConfigAtomic(
  path: string,
  next: Record<string, unknown>,
): { written: string; serialized: string } {
  const dir = dirname(path)
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true, mode: 0o700 })
  const serialized = JSON.stringify(next, null, 2) + "\n"
  const tmpPath = `${path}.tmp.${process.pid}.${Date.now()}`

  // 1+2: write the temp file, fsync its data to disk, close.
  const fd = openSync(tmpPath, "w", 0o600)
  try {
    writeSync(fd, serialized)
    fsyncSync(fd)
  } finally {
    closeSync(fd)
  }

  // 3a: atomic rename over the destination.
  renameSync(tmpPath, path)

  // 3b: fsync the parent directory so the rename itself is durable
  // (POSIX requirement for ext4 with default mount options; harmless
  // on filesystems that don't need it). Best-effort on platforms
  // where opening a directory for fsync is not supported (Windows);
  // swallow the EISDIR/EACCES path so we don't break Windows users.
  try {
    const dirFd = openSync(dir, "r")
    try {
      fsyncSync(dirFd)
    } finally {
      closeSync(dirFd)
    }
  } catch {
    // platform doesn't support directory fsync — rely on the file
    // fsync above plus the periodic flush
  }

  // 4: read back to confirm we didn't write garbage.
  const roundTrip = readFileSync(path, "utf-8")
  JSON.parse(roundTrip) // throws on corruption — surfaces as tool error
  return { written: path, serialized }
}

export interface InstallServerConfigArgs {
  port?: number
  overwrite?: boolean
  confirm?: boolean
  configPath?: string
}

export type InstallServerConfigResult =
  | { ok: true; status: "preview"; plan: PlannedServerConfigUpdate; configPath: string }
  | { ok: true; status: "noop"; plan: PlannedServerConfigUpdate; configPath: string }
  | { ok: true; status: "written"; plan: PlannedServerConfigUpdate; configPath: string }
  | { ok: false; status: "needs-overwrite"; plan: PlannedServerConfigUpdate; configPath: string }
  | { ok: false; status: "invalid-port"; reason: string }
  | { ok: false; status: "read-error"; reason: string; configPath: string }
  | { ok: false; status: "plan-error"; reason: string; configPath: string }
  | { ok: false; status: "write-error"; reason: string; configPath: string }

/**
 * Pure orchestration of the F6 tool. The plugin tool body wraps this
 * with arg parsing and `okResult` / `errorResult` formatting; tests
 * call it directly with a tmp config path.
 *
 * Behaviour:
 *   - Validates the requested port (integer, 0..65535).
 *   - Reads existing config (treats missing as `{}`).
 *   - Plans the update; for `overwrite-port` requires
 *     `overwrite: true`.
 *   - Without `confirm: true` returns a preview status so the
 *     caller renders a dry-run; with `confirm: true` actually
 *     writes the file atomically.
 */
export function executeInstallServerConfig(args: InstallServerConfigArgs): InstallServerConfigResult {
  const port = args.port ?? DEFAULT_SERVER_PORT
  if (!Number.isInteger(port) || port < 0 || port > 65535) {
    return {
      ok: false,
      status: "invalid-port",
      reason: `port must be an integer in [0, 65535] (got ${args.port}).`,
    }
  }

  const configPath = args.configPath ?? DEFAULT_OPENCODE_CONFIG_PATH

  let current: Record<string, unknown>
  try {
    current = readOpencodeConfig(configPath)
  } catch (error) {
    return {
      ok: false,
      status: "read-error",
      reason: error instanceof Error ? error.message : String(error),
      configPath,
    }
  }

  let plan: PlannedServerConfigUpdate
  try {
    plan = planServerConfigUpdate(current, port)
  } catch (error) {
    return {
      ok: false,
      status: "plan-error",
      reason: error instanceof Error ? error.message : String(error),
      configPath,
    }
  }

  if (plan.action.kind === "noop") {
    return { ok: true, status: "noop", plan, configPath }
  }

  if (plan.action.kind === "overwrite-port" && !args.overwrite) {
    return { ok: false, status: "needs-overwrite", plan, configPath }
  }

  if (!args.confirm) {
    return { ok: true, status: "preview", plan, configPath }
  }

  try {
    writeOpencodeConfigAtomic(configPath, plan.after)
  } catch (error) {
    return {
      ok: false,
      status: "write-error",
      reason: error instanceof Error ? error.message : String(error),
      configPath,
    }
  }
  return { ok: true, status: "written", plan, configPath }
}
