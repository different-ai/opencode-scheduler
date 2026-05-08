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
export declare const DEFAULT_OPENCODE_CONFIG_PATH: string;
/**
 * Default `server.port` value F6 writes when the user doesn't pass
 * one explicitly. `0` matches the CLI `--port 0` shortcut: opencode
 * tries 4096, then falls back to OS-assigned random. Requires the
 * F7 upstream Zod fix (commit `477861e2b` in `opencode-fork`) to
 * pass schema validation; before that commit lands upstream, the
 * config file written here will be rejected at config-load time —
 * users on a pre-F7 opencode should pass an explicit positive port.
 */
export declare const DEFAULT_SERVER_PORT = 0;
export type ServerConfigAction = {
    kind: "noop";
    reason: "port-already-matches";
} | {
    kind: "add-server";
    port: number;
} | {
    kind: "add-port";
    port: number;
} | {
    kind: "overwrite-port";
    previous: number;
    next: number;
};
export interface PlannedServerConfigUpdate {
    action: ServerConfigAction;
    before: Record<string, unknown>;
    after: Record<string, unknown>;
    /** Human-readable summary of what changed (one line per change). */
    diff: string;
}
/**
 * Read and parse the opencode JSON config. Returns `{}` when the
 * file does not exist (treated as "no config yet"). Throws on
 * unparseable JSON — better to surface the read error than to
 * silently overwrite a hand-edited file we can't understand.
 */
export declare function readOpencodeConfig(path?: string): Record<string, unknown>;
/**
 * Compute what the F6 tool should do without writing anything. The
 * caller renders the result; on `overwrite-port` the tool MAY refuse
 * unless the user explicitly opted in via `overwrite: true`.
 *
 * Preserves every other top-level key (and every other key inside
 * `server`) so it's safe to run on a config the user has hand-edited.
 */
export declare function planServerConfigUpdate(current: Record<string, unknown>, desiredPort: number): PlannedServerConfigUpdate;
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
export declare function writeOpencodeConfigAtomic(path: string, next: Record<string, unknown>): {
    written: string;
    serialized: string;
};
export interface InstallServerConfigArgs {
    port?: number;
    overwrite?: boolean;
    confirm?: boolean;
    configPath?: string;
}
export type InstallServerConfigResult = {
    ok: true;
    status: "preview";
    plan: PlannedServerConfigUpdate;
    configPath: string;
} | {
    ok: true;
    status: "noop";
    plan: PlannedServerConfigUpdate;
    configPath: string;
} | {
    ok: true;
    status: "written";
    plan: PlannedServerConfigUpdate;
    configPath: string;
} | {
    ok: false;
    status: "needs-overwrite";
    plan: PlannedServerConfigUpdate;
    configPath: string;
} | {
    ok: false;
    status: "invalid-port";
    reason: string;
} | {
    ok: false;
    status: "read-error";
    reason: string;
    configPath: string;
} | {
    ok: false;
    status: "plan-error";
    reason: string;
    configPath: string;
} | {
    ok: false;
    status: "write-error";
    reason: string;
    configPath: string;
};
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
export declare function executeInstallServerConfig(args: InstallServerConfigArgs): InstallServerConfigResult;
