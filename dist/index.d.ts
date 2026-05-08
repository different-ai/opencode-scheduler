/**
 * OpenCode Scheduler Plugin
 *
 * Schedule recurring jobs using launchd (Mac), systemd (Linux), schtasks (Windows), or cron fallback.
 * Jobs are stored under ~/.config/opencode/scheduler/ (scoped by workdir).
 *
 * Features:
 * - Survives reboots
 * - Catches up on missed runs (if computer was asleep)
 * - Cross-platform (Mac + Linux + Windows)
 * - Working directory support for MCP configs
 * - Environment variable injection (PATH for node/npx)
 */
import type { Plugin } from "@opencode-ai/plugin";
import type { BadRequestError } from "@opencode-ai/sdk";
import { type RegistryEntry } from "./registry";
import { type InstallServerConfigResult } from "./serverConfig";
type OpencodeRunFormat = "default" | "json";
type SchedulerEnvMode = "snapshot" | "minimal" | "login-shell";
/**
 * Scheduler-level env config (read from
 * `~/.config/opencode/opencode-scheduler.json`).
 *
 * `mode`     — default 'snapshot' (capture full process.env minus denylist).
 *              'minimal' = only PATH/HOME/USER/SHELL.
 *              'login-shell' = wrap invocation in `$SHELL -lic ...` (S3).
 * `exclude`  — extends the scheduler-internal denylist for additional keys
 *              the user does not want baked into job env.
 * `set`      — explicit overrides applied after the snapshot.
 *
 * Legacy keys `preserve` / `preserveOpencodeEnv` are accepted for
 * back-compat but ignored with a one-shot warn-log on first read.
 */
type SchedulerEnvConfig = {
    mode?: SchedulerEnvMode;
    exclude?: string[];
    set?: Record<string, string>;
    /** @deprecated legacy v1.3 allowlist; ignored as of v1.4 */
    preserve?: string[];
    /** @deprecated legacy v1.3 toggle; ignored as of v1.4 */
    preserveOpencodeEnv?: boolean;
};
/**
 * Per-job env snapshot persisted alongside the job. Captured at
 * schedule-time so the OS scheduler runs with the same env as the
 * terminal where it was scheduled (PATH, MCP tokens, plugin secrets,
 * locale, OPENCODE_*).
 *
 * Trust boundary: snapshot may contain secrets (API keys, MCP tokens).
 * Files are user-only — see README "Env behavior".
 */
type JobEnv = {
    mode: SchedulerEnvMode;
    snapshot?: Record<string, string>;
};
/**
 * Capture the current process env as a job-level snapshot.
 *
 * `mode='snapshot'` — copy of process.env minus the denylist; final overrides
 *                     applied from `set`.
 * `mode='minimal'`  — only PATH/HOME/USER/SHELL plus `set` overrides.
 * `mode='login-shell'` — same snapshot as 'snapshot'; the wrapping is applied
 *                        at invocation time (S3), not here.
 */
export declare function captureJobEnv(config?: SchedulerEnvConfig): JobEnv;
interface JobRunSpec {
    prompt?: string;
    command?: string;
    arguments?: string;
    files?: string[];
    agent?: string;
    model?: string;
    variant?: string;
    title?: string;
    share?: boolean;
    continue?: boolean;
    session?: string;
    runFormat?: OpencodeRunFormat;
    attachUrl?: string;
    port?: number;
}
/**
 * How the scheduler chooses the target opencode session for a job.
 *
 * - `current`     — write into the session that called `schedule_job`.
 *                   Default when run from inside an opencode session.
 * - `existing`    — write into a session id the user supplies explicitly.
 * - `new-per-job` — create one dedicated session at schedule-time,
 *                   reuse it for every run.
 * - `new-per-run` — create a fresh session every time the job fires.
 */
type SessionPolicy = "current" | "existing" | "new-per-job" | "new-per-run";
/**
 * Where the scheduler tries to deliver the prompt at fire-time.
 *
 * - `prefer-live-server` — try live HTTP delivery first, fall back to
 *                          headless `opencode run` if no server reachable.
 * - `headless-only`      — never attempt live HTTP; always spawn a CLI.
 */
type ExecutionPolicy = "prefer-live-server" | "headless-only";
/**
 * What the scheduler does when the target session is busy at fire-time.
 *
 * - `execute`        — wait up to job.timeoutSeconds, then deliver. If
 *                      still busy, fail the run (next scheduled fire
 *                      tries again).
 * - `leave-message`  — deliver immediately with `noReply: true` so the
 *                      message lands in the session for the user/agent
 *                      to pick up later.
 */
type DeliveryPolicy = "execute" | "leave-message";
/**
 * Permission ruleset applied to sessions created by the scheduler.
 * Mirrors `opencode-fork/packages/opencode/src/cli/cmd/run.ts:353-369`
 * so scheduled sessions behave like `opencode run` sessions: no
 * questions, no plan toggling.
 *
 * NOT applied to sessions chosen via `current` or `existing` — there
 * is no public PATCH route to mutate an existing session's permission.
 * Users who want strict no-questions pick `new-per-job` / `new-per-run`.
 */
export type ScheduledPermissionRule = {
    permission: string;
    action: "deny";
    pattern: string;
};
type JobInvocation = {
    command: string;
    args: string[];
};
interface Job {
    scopeId?: string;
    slug: string;
    name: string;
    schedule: string;
    prompt?: string;
    attachUrl?: string;
    run?: JobRunSpec;
    invocation?: JobInvocation;
    /**
     * Per-job env snapshot persisted at schedule-time. Supervisor merges
     * `env.snapshot` into the run env before scheduler-only keys
     * (OPENCODE_PERMISSION, OPENCODE_SCHEDULER_RUN_ID).
     *
     * Legacy jobs without this field fall back to mode='minimal' at
     * supervisor time with a one-line warning to recreate the job.
     */
    env?: JobEnv;
    /**
     * Headless-mode invocation snapshot, built at schedule-time without
     * `--attach`. Used by the runner as the fallback path when live HTTP
     * delivery fails (S5).
     */
    headlessInvocation?: JobInvocation;
    /**
     * Persisted session policy chosen at schedule-time. The runner uses
     * this at fire-time to decide whether to create a new session
     * (`new-per-run`) or use the persisted `run.session`.
     */
    sessionPolicy?: SessionPolicy;
    executionPolicy?: ExecutionPolicy;
    deliveryPolicy?: DeliveryPolicy;
    timeoutSeconds?: number;
    source?: string;
    workdir?: string;
    createdAt: string;
    updatedAt?: string;
    lastRunAt?: string;
    lastRunExitCode?: number;
    lastRunError?: string;
    lastRunSource?: "manual" | "scheduled";
    lastRunStatus?: "running" | "success" | "failed";
}
/**
 * Idempotently ensure the scheduled-job-best-practices skill exists in
 * `workdir/.opencode/skill/`. Called by `schedule_job` so a freshly-cloned
 * project (or one that never installed the skill) gets a copy on first
 * job creation, without making the user run install_skill manually.
 *
 * - 'present'   → SKILL.md already exists; do not overwrite (user may
 *                 have local edits; updates flow via explicit install_skill
 *                 with overwrite=true).
 * - 'installed' → wrote it now.
 * - 'failed'    → could not write (logged as a non-fatal note; job creation
 *                 still proceeds because the skill is a soft dependency).
 */
export declare function ensureBestPracticesSkill(workdir: string): {
    status: "present" | "installed" | "failed";
    path: string;
    reason?: string;
};
export declare function getEnhancedPath(options?: {
    withTerminalPath?: boolean;
}): string;
/**
 * Pick the bootstrap-env subset from a job's snapshot, with PATH
 * overridden by the caller-supplied terminal-first PATH. Falls back to
 * `process.env` for missing keys (covers legacy jobs without snapshot).
 */
export declare function pickBootstrapEnv(job: Job, terminalPath: string): Record<string, string>;
/**
 * Parse a `sessionPolicy` argument supplied by the agent. Strict — no
 * default, no silent fallback. F1 makes `sessionPolicy` REQUIRED on
 * `schedule_job` so the agent must always elicit an explicit choice
 * from the user; a silent default ('current') was the root cause of
 * the "Status: success but TUI never refreshed" reproduction (see
 * EXECUTION LOG and Findings A in the plan).
 *
 * For reading persisted `job.json` files that pre-date F1, use
 * {@link getEffectiveSessionPolicy} which falls back to `current`.
 */
export declare function parseSessionPolicy(raw: unknown): SessionPolicy;
/**
 * Resolve the effective `sessionPolicy` for an already-persisted job.
 * Defaults to `current` for back-compat with `job.json` files written
 * before F1 made the arg required on `schedule_job`. Read paths only;
 * NEVER reuse on the schedule_job arg path — see {@link parseSessionPolicy}.
 */
export declare function getEffectiveSessionPolicy(job: {
    sessionPolicy?: SessionPolicy;
}): SessionPolicy;
export declare function parseExecutionPolicy(raw: unknown): ExecutionPolicy;
export declare function parseDeliveryPolicy(raw: unknown): DeliveryPolicy;
/**
 * Schedule-time validation matrix (S6). Returns an error message string
 * if validation fails, or undefined on success.
 *
 * The session.create call for new-per-job is performed by the caller
 * (it needs the resolved id) — this function only checks the
 * preconditions that are local to the args themselves.
 */
export declare function validateSessionPolicyArgs(input: {
    sessionPolicy: SessionPolicy;
    executionPolicy: ExecutionPolicy;
    deliveryPolicy: DeliveryPolicy;
    sessionId?: string;
    attachUrl?: string;
    toolSessionID?: string;
}): string | undefined;
/**
 * `serverUrl` from the Plugin runtime is `http://opencode.internal/...`
 * when the host opencode was launched without `--port`. Used by F2a
 * to decide whether to warn the user that live in-TUI delivery is
 * impossible for the chosen sessionPolicy.
 */
export declare function isInternalServerUrl(serverUrl: URL | string): boolean;
/**
 * Resolve the effective `attachUrl` for a `schedule_job` call,
 * implementing F2a / F2b:
 *
 * - **Explicit `attachUrl` arg** → use as-is. No warning, no auto-attach.
 * - **No arg + `executionPolicy === 'headless-only'`** → leave
 *   `attachUrl` undefined and emit no warning. The user opted out of
 *   live HTTP delivery on purpose; F2b auto-promotion would conflict
 *   with that choice and trip the
 *   "headless-only is incompatible with attachUrl" validator.
 * - **No arg + external `serverUrl`** (`http://127.0.0.1:N/...` because
 *   the host opencode was started with `--port`) → auto-promote
 *   `serverUrl` to `attachUrl` (F2b). The plugin already lives inside
 *   that opencode process, so any prompt delivered there refreshes the
 *   live TUI. Returns `autoFromServerUrl: true` so the caller can log
 *   the substitution.
 * - **No arg + internal `serverUrl`** (`http://opencode.internal/...`)
 *   AND `sessionPolicy` routes to the calling TUI (`current` /
 *   `existing`) → leave `attachUrl` undefined and set
 *   `internalWarning: true` so the caller appends a warning explaining
 *   that the open TUI will not refresh until reopened (F2a).
 * - **No arg + internal `serverUrl`** + `sessionPolicy` is
 *   `new-per-job` / `new-per-run` → no warning (the new session is not
 *   the user's currently open TUI; headless delivery into a brand-new
 *   session is the expected, correct behavior).
 */
export declare function resolveEffectiveAttachUrl(input: {
    argAttachUrl?: string;
    serverUrl: URL | string;
    sessionPolicy: SessionPolicy;
    executionPolicy: ExecutionPolicy;
}): {
    attachUrl?: string;
    autoFromServerUrl: boolean;
    internalWarning: boolean;
};
/**
 * Derive the registry entry for the calling opencode process from
 * the plugin's `serverUrl` input. Returns `undefined` for the
 * in-process IPC sentinel (`http://opencode.internal/...`) — those
 * entries would be useless to any external reader.
 *
 * Exported so plugin init can stay declarative and so the helper is
 * unit-testable without spinning up the full plugin runtime.
 */
export declare function buildOwnRegistryEntry(input: {
    serverUrl: URL | string;
    pid?: number;
    workdir?: string;
    startedAt?: string;
    agent?: "tui" | "headless";
}): RegistryEntry | undefined;
/**
 * Wire up F5 plugin-side bookkeeping for one opencode process:
 *
 *   1. Sweep stale entries left behind by previously-crashed
 *      processes (cheap O(N) on every plugin init).
 *   2. If the calling opencode is reachable externally (i.e. NOT the
 *      in-process IPC sentinel), publish our own `<pid>.json` so the
 *      scheduler runner can discover us at fire-time.
 *   3. Register one-shot exit handlers that best-effort-unlink our
 *      entry. Crash without firing handlers is fine — the next plugin
 *      init's sweep handles the orphan.
 *
 * All side effects are guarded by `try`: a registry failure must
 * never prevent the plugin from starting up.
 */
export declare function initRegistryForPlugin(input: {
    serverUrl: URL | string;
    workdir?: string;
    agent?: "tui" | "headless";
    registryDir?: string;
}): {
    entry?: RegistryEntry;
    sweepRemoved: number;
};
/**
 * Render the result of `executeInstallServerConfig` as a single
 * agent-readable text block. Each status maps to one short paragraph
 * with the diff (when relevant) and the next-step hint, so the agent
 * can copy/paste a useful response back to the user without parsing
 * structured fields.
 */
export declare function formatInstallServerConfigResult(result: InstallServerConfigResult): string;
/**
 * Build the F2a warning block appended to `schedule_job` success output
 * when the host opencode is in-process-only and live delivery into the
 * calling TUI is impossible.
 */
export declare function buildInternalServerWarning(): string;
/**
 * Structural status returned by `ensureBestPracticesSkill`. Pulled out
 * as a named type so {@link formatScheduleJobSuccess} can be tested
 * without spinning up the real skill installer.
 */
export interface SkillEnsureStatus {
    status: "present" | "installed" | "failed";
    path: string;
    reason?: string;
}
/**
 * Render the `schedule_job` success text. Pulled out of the tool body
 * so the F2a warning placement (and F2b auto-attach line) can be unit
 * tested without spinning up the full plugin runtime / fs / OS scheduler
 * stack. The tool body wires the inputs; this function owns the layout.
 */
export declare function formatScheduleJobSuccess(input: {
    name: string;
    schedule: string;
    scheduleHuman: string;
    platformName: string;
    workdir: string;
    attachUrl?: string;
    attachUrlAutoFromServerUrl: boolean;
    primaryLine: string;
    skillEnsure: SkillEnsureStatus;
    internalWarning: boolean;
    reliabilityLine: string;
}): string;
/**
 * Narrow shape of the OpenCode SDK client we need for session creation.
 * Structurally compatible with `OpencodeClient` so `client` can be passed
 * directly without a cast. `body.permission` is supported by the server
 * route even though older SDK versions omit it from the body type — we
 * include it here to make that contract explicit.
 */
export type SchedulerSessionClient = {
    session: {
        create(options: {
            body?: {
                parentID?: string;
                title?: string;
                permission?: readonly ScheduledPermissionRule[];
            };
        }): Promise<{
            data?: {
                id?: string;
            };
            error?: BadRequestError | {
                message?: string;
            };
        }>;
    };
};
/**
 * Create a local scheduler session through the plugin-provided client.
 * OpenCode wires that client to Server.App().fetch in-process; unlike
 * serverUrl, it does not require an externally listening HTTP port.
 */
export declare function createSchedulerSessionWithClient(input: {
    client: SchedulerSessionClient;
    title: string;
    permission: readonly ScheduledPermissionRule[];
}): Promise<string>;
export declare const SchedulerPlugin: Plugin;
export default SchedulerPlugin;
