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
import type { Plugin } from "@opencode-ai/plugin"
import { tool } from "@opencode-ai/plugin"
import type { BadRequestError } from "@opencode-ai/sdk"
import { chmodSync, createWriteStream, existsSync, mkdirSync, readdirSync, readFileSync, renameSync, rmSync, writeFileSync, unlinkSync } from "fs"
import { basename, dirname, join, resolve as resolvePath } from "path"
import { homedir, platform } from "os"
import { execFileSync, execSync, spawn, type ChildProcess } from "child_process"
import { fileURLToPath } from "url"
import {
  REGISTRY_SCHEMA_VERSION,
  removeRegistryEntry,
  sweepStaleEntries,
  writeRegistryEntry,
  type RegistryEntry,
} from "./registry"
import {
  DEFAULT_OPENCODE_CONFIG_PATH,
  DEFAULT_SERVER_PORT,
  executeInstallServerConfig,
  type InstallServerConfigResult,
} from "./serverConfig"

// Storage location - shared with other opencode tools
const OPENCODE_CONFIG = join(homedir(), ".config", "opencode")
const LEGACY_JOBS_DIR = join(OPENCODE_CONFIG, "jobs")
const LOGS_DIR = join(OPENCODE_CONFIG, "logs")
const SCHEDULER_DIR = join(OPENCODE_CONFIG, "scheduler")
const SCOPES_DIR = join(SCHEDULER_DIR, "scopes")
const SUPERVISOR_PATH = join(SCHEDULER_DIR, "supervisor.pl")
const SCHEDULER_CONFIG = join(OPENCODE_CONFIG, "opencode-scheduler.json")

// Platform detection
const IS_MAC = platform() === "darwin"
const IS_LINUX = platform() === "linux"
const IS_WINDOWS = platform() === "win32"

// launchd paths (Mac)
const LAUNCH_AGENTS_DIR = join(homedir(), "Library", "LaunchAgents")
const LAUNCHD_PREFIX = "com.opencode.job"

// systemd paths (Linux)
const SYSTEMD_USER_DIR = join(homedir(), ".config", "systemd", "user")

// Windows Task Scheduler
const WINDOWS_TASK_ROOT = "\\OpenCode"
const WINDOWS_TASK_PREFIX = "opencode-job"

// cron backend
const CRON_MANAGED_PREFIX = "opencode-scheduler"

// Ensure directory exists
function ensureDir(dir: string) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}

/**
 * Ensure a directory exists with user-only (0700) permissions. Use for
 * directories that store secret-bearing files (scheduler scopes, log dirs
 * that may include env-leaking text, etc.). On Linux some distros default
 * `~` to 0755, so the parent dir alone doesn't protect children.
 *
 * `chmodSync` is a no-op on Windows (fs ignores the mode bits) — that's
 * fine; Windows storage isolation is handled by the user profile, not
 * POSIX modes.
 */
function ensureDirUserOnly(dir: string): void {
  ensureDir(dir)
  try {
    chmodSync(dir, 0o700)
  } catch {
    // Best-effort: if chmod fails (e.g. read-only filesystem in tests),
    // continue. The directory still exists and the file-level chmod is
    // the primary protection.
  }
}

/**
 * Atomically write a file with user-only (0600) permissions. Use for any
 * file that may contain secrets (job.json with env.snapshot, runner.js
 * if it ever embedded secrets — currently it doesn't).
 *
 * Atomicity: write to <path>.tmp, then rename. Avoids partial reads if
 * another process is reading the file while supervisor.pl is updating
 * lastRun fields.
 */
function writeFileUserOnly(path: string, content: string): void {
  const tmp = `${path}.tmp`
  writeFileSync(tmp, content)
  try {
    chmodSync(tmp, 0o600)
  } catch {
    // see ensureDirUserOnly comment
  }
  // rename is atomic on POSIX same-filesystem; Node handles cross-FS
  // transparently (falls back to copy+unlink internally).
  try {
    renameSync(tmp, path)
  } catch {
    // Fallback: write directly (loses atomicity but preserves correctness).
    writeFileSync(path, content)
    try {
      chmodSync(path, 0o600)
    } catch {}
    try {
      unlinkSync(tmp)
    } catch {}
  }
}

// Slugify a name
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

function normalizeWorkdirPath(input: string): string {
  const trimmed = input.trim()
  if (!trimmed) return homedir()
  return resolvePath(trimmed)
}

function fnv1a64(input: string): bigint {
  // 64-bit FNV-1a
  let hash = 0xcbf29ce484222325n
  const prime = 0x100000001b3n
  const data = Buffer.from(input, "utf8")
  for (const byte of data) {
    hash ^= BigInt(byte)
    hash = (hash * prime) & 0xffffffffffffffffn
  }
  return hash
}

function fnv1a64Hex(input: string): string {
  return fnv1a64(input).toString(16).padStart(16, "0")
}

function deriveScopeId(workdir: string): string {
  const normalized = normalizeWorkdirPath(workdir)
  const base = slugify(basename(normalized)) || "workspace"
  // 48 bits of hash is enough here; keep label/unit names short.
  const suffix = fnv1a64Hex(normalized).slice(0, 12)
  return `${base}-${suffix}`
}

function scopeDir(scopeId: string): string {
  return join(SCOPES_DIR, scopeId)
}

function scopeJobsDir(scopeId: string): string {
  return join(scopeDir(scopeId), "jobs")
}

function scopeLocksDir(scopeId: string): string {
  return join(scopeDir(scopeId), "locks")
}

function scopeRunsDir(scopeId: string): string {
  return join(scopeDir(scopeId), "runs")
}

function scopeLogsDir(scopeId: string): string {
  return join(LOGS_DIR, "scheduler", scopeId)
}

function jobFilePath(scopeId: string, slug: string): string {
  return join(scopeJobsDir(scopeId), `${slug}.json`)
}

function scopedLogPath(scopeId: string, slug: string): string {
  return join(scopeLogsDir(scopeId), `${slug}.log`)
}

function currentScopeId(): string {
  return deriveScopeId(process.cwd())
}

const SUPERVISOR_SCRIPT = `#!/usr/bin/perl
use strict;
use warnings;
use JSON::PP;
use File::Basename qw(dirname);
use File::Path qw(make_path);
use POSIX qw(setsid strftime);
use Time::HiRes qw(time);

# opencode-scheduler supervisor v1

sub iso_now {
  my @t = localtime(time());
  return strftime("%Y-%m-%dT%H:%M:%S%z", @t);
}

sub read_json {
  my ($path) = @_;
  open my $fh, "<", $path or die "Failed to read $path: $!\n";
  local $/;
  my $raw = <$fh>;
  close $fh;
  my $json = JSON::PP->new->utf8->relaxed;
  return $json->decode($raw);
}

sub write_json_atomic {
  my ($path, $data) = @_;
  my $tmp = "$path.tmp.$$";
  my $json = JSON::PP->new->utf8->canonical;
  open my $fh, ">", $tmp or die "Failed to write $tmp: $!\n";
  print $fh $json->encode($data);
  close $fh or die "Failed to close $tmp: $!\n";
  # 0600 — job files contain env.snapshot which may include secrets.
  # rename preserves the source perms, so we chmod the temp first.
  chmod 0600, $tmp;
  rename $tmp, $path or die "Failed to rename $tmp -> $path: $!\n";
}

sub append_jsonl {
  my ($path, $data) = @_;
  my $json = JSON::PP->new->utf8->canonical;
  open my $fh, ">>", $path or die "Failed to append $path: $!\n";
  print $fh $json->encode($data) . "\n";
  close $fh;
}

sub pid_alive {
  my ($pid) = @_;
  return 0 if !$pid;
  return kill 0, $pid;
}

sub random_id {
  my $n = int(rand(1_000_000_000));
  return sprintf("%09d", $n);
}

my $job_path = shift @ARGV;
if (!$job_path) { die "usage: supervisor.pl <job.json>\n"; }

my $job = read_json($job_path);
my $scope_id = $job->{scopeId} || "";
my $slug = $job->{slug} || "";
if (!$scope_id || !$slug) { die "job missing scopeId/slug\n"; }

my $home = $ENV{HOME} || "";
if (!$home) { die "HOME is not set\n"; }

my $config_root = "$home/.config/opencode";
my $scheduler_root = "$config_root/scheduler/scopes/$scope_id";
my $locks_dir = "$scheduler_root/locks";
my $runs_dir = "$scheduler_root/runs";
my $logs_dir = "$config_root/logs/scheduler/$scope_id";

make_path($locks_dir);
make_path($runs_dir);
make_path($logs_dir);

my $log_path = "$logs_dir/$slug.log";
open STDOUT, ">>", $log_path or die "Failed to open log $log_path: $!\n";
open STDERR, ">&STDOUT" or die "Failed to dup stderr: $!\n";
select STDOUT; $| = 1;
select STDERR; $| = 1;

my $lock_path = "$locks_dir/$slug.json";
if (-e $lock_path) {
  my $lock = eval { read_json($lock_path) };
  my $pid = ($lock && ref($lock) eq 'HASH') ? ($lock->{pid} || 0) : 0;
  if (pid_alive($pid)) {
    my $now = iso_now();
    print "\n=== Scheduled run skipped (already running pid=$pid) $now ===\n";
    exit 0;
  }
  unlink $lock_path;
}

my $run_id = time() . "-" . random_id();
my $started_at = iso_now();
my $t0 = time();

write_json_atomic($lock_path, { pid => $$, startedAt => $started_at, runId => $run_id });

# Update job metadata: running
$job->{lastRunAt} = $started_at;
$job->{lastRunSource} = "scheduled";
$job->{lastRunStatus} = "running";
delete $job->{lastRunExitCode};
delete $job->{lastRunError};
$job->{updatedAt} = $started_at;
write_json_atomic($job_path, $job);

# Merge per-job env snapshot into %ENV before scheduler-only overrides.
# Snapshot wins over launchd/systemd-provided env; scheduler-only keys
# (OPENCODE_PERMISSION, OPENCODE_SCHEDULER_RUN_ID) wins over snapshot.
#
# Legacy jobs without job.env get a one-line warning printed into the
# log; they fall back to whatever env launchd/systemd handed us, which
# is just PATH for jobs created with v1.3.x.
if (!$job->{env} || ref($job->{env}) ne 'HASH') {
  print "[opencode-scheduler] WARN: job has no env snapshot (created with v1.3.x); ",
        "recreate the job to capture the full terminal env.\\n";
} else {
  # The mode (snapshot/minimal/login-shell) was already applied at capture
  # time when env.snapshot was populated — supervisor only has to merge
  # whatever is already there. login-shell wrap is in job.invocation.
  my $snap = $job->{env}->{snapshot};
  if ($snap && ref($snap) eq 'HASH') {
    for my $k (keys %$snap) {
      $ENV{$k} = $snap->{$k};
    }
  }
}

# Force non-interactive scheduled runs
my $perm = { question => "deny" };
if ($ENV{OPENCODE_PERMISSION}) {
  my $existing = eval { JSON::PP->new->decode($ENV{OPENCODE_PERMISSION}) };
  if ($existing && ref($existing) eq 'HASH') {
    $perm = { %$existing, %$perm };
  }
}
$ENV{OPENCODE_PERMISSION} = JSON::PP->new->canonical->encode($perm);
$ENV{OPENCODE_SCHEDULER_RUN_ID} = $run_id;

print "\n=== Scheduled run $started_at runId=$run_id ===\n";

my $inv = $job->{invocation};
if (!$inv || ref($inv) ne 'HASH' || !$inv->{command} || ref($inv->{args}) ne 'ARRAY') {
  my $now = iso_now();
  print "\n=== Supervisor error $now: job missing invocation.command/args ===\n";
  $job->{lastRunStatus} = "failed";
  $job->{lastRunError} = "job missing invocation";
  $job->{updatedAt} = $now;
  write_json_atomic($job_path, $job);
  unlink $lock_path;
  exit 1;
}

my $command = $inv->{command};
my @args = @{ $inv->{args} };

my $workdir = $job->{workdir} || $home;

# === Runner-first delivery (S5) ===
#
# When the job has a live-delivery target (attachUrl) and runs aren't
# explicitly headless-only, try the bundled runner first. It performs
# health/idle/busy preflight + HTTP prompt_async; on exit 10 we fall
# through to the headless invocation.
#
# Resolution rules:
#   - Look for runner at <plugin>/dist/runner.js
#   - The runner path is recorded via OPENCODE_SCHEDULER_RUNNER_PATH if
#     present (set by the plugin at install time); otherwise we probe a
#     conventional location in ~/.config/opencode/scheduler/runner.js.
my $runner_path = $ENV{OPENCODE_SCHEDULER_RUNNER_PATH} || "$home/.config/opencode/scheduler/runner.js";
my $execution_policy = $job->{executionPolicy} || "prefer-live-server";
my $live_target = "";
if ($job->{run} && ref($job->{run}) eq 'HASH' && $job->{run}->{attachUrl}) {
  $live_target = $job->{run}->{attachUrl};
} elsif ($job->{attachUrl}) {
  $live_target = $job->{attachUrl};
}

my $tried_live = 0;
my $live_exit = -1;
if ($live_target && $execution_policy ne "headless-only" && -f $runner_path) {
  $tried_live = 1;
  print "\n=== runner: live delivery attempt to $live_target ===\n";
  my @runner_cmd = ("/usr/bin/env", "node", $runner_path, "--job", $job_path);
  if ($job->{timeoutSeconds}) {
    push @runner_cmd, "--timeout-seconds", $job->{timeoutSeconds};
  }
  my $rc = system(@runner_cmd);
  $live_exit = ($rc == -1) ? 10 : ($rc >> 8);
  if ($live_exit == 0) {
    my $now = iso_now();
    print "\n=== runner: live delivery success $now ===\n";
    $job->{lastRunStatus} = "success";
    $job->{lastRunExitCode} = 0;
    $job->{updatedAt} = $now;
    write_json_atomic($job_path, $job);
    unlink $lock_path;
    exit 0;
  }
  if ($live_exit == 11) {
    my $now = iso_now();
    print "\n=== runner: contract error (exit 11) $now; not falling back ===\n";
    $job->{lastRunStatus} = "failed";
    $job->{lastRunExitCode} = 11;
    $job->{lastRunError} = "runner contract error";
    $job->{updatedAt} = $now;
    write_json_atomic($job_path, $job);
    unlink $lock_path;
    exit 11;
  }
  print "\n=== runner: live delivery failed (exit $live_exit); falling back to headless ===\n";

  # Use headlessInvocation if present so we don't pass --attach again.
  if ($job->{headlessInvocation} && ref($job->{headlessInvocation}) eq 'HASH'
      && $job->{headlessInvocation}->{command}
      && ref($job->{headlessInvocation}->{args}) eq 'ARRAY') {
    $command = $job->{headlessInvocation}->{command};
    @args = @{ $job->{headlessInvocation}->{args} };
  }
}

my $timeout = $job->{timeoutSeconds};
$timeout = undef if defined($timeout) && $timeout !~ /^\\d+$/;

my $timed_out = 0;
my $child_pid = fork();
if (!defined $child_pid) {
  my $now = iso_now();
  print "\n=== Supervisor error $now: fork failed: $! ===\n";
  $job->{lastRunStatus} = "failed";
  $job->{lastRunError} = "fork failed";
  $job->{updatedAt} = $now;
  write_json_atomic($job_path, $job);
  unlink $lock_path;
  exit 1;
}

if ($child_pid == 0) {
  chdir $workdir or die "Failed to chdir to $workdir: $!\n";
  eval { setsid(); };
  exec { $command } $command, @args;
  die "Failed to exec $command: $!\n";
}

if (defined($timeout) && $timeout > 0) {
  local $SIG{ALRM} = sub {
    $timed_out = 1;
    my $now = iso_now();
    print "\n=== Timeout after $timeout seconds $now; sending SIGTERM ===\n";
    kill 'TERM', -$child_pid;
    sleep 5;
    print "\n=== Forcing SIGKILL $now ===\n";
    kill 'KILL', -$child_pid;
  };
  alarm($timeout);
}

my $waited = waitpid($child_pid, 0);
my $status = $?;
alarm(0);

my $finished_at = iso_now();
my $duration_ms = int((time() - $t0) * 1000);
my $exit_code = ($status >> 8);
if ($timed_out) {
  $exit_code = 124;
}

my $final_status = "failed";
my $final_error = undef;
if ($timed_out) {
  $final_status = "failed";
  $final_error = "timeout";
} elsif ($waited != $child_pid) {
  $final_status = "failed";
  $final_error = "waitpid failed";
} elsif ($status == 0) {
  $final_status = "success";
} else {
  $final_status = "failed";
  $final_error = "exit code $exit_code";
}

$job->{lastRunStatus} = $final_status;
$job->{lastRunExitCode} = $exit_code;
$job->{lastRunError} = $final_error if defined $final_error;
$job->{updatedAt} = $finished_at;
write_json_atomic($job_path, $job);

append_jsonl("$runs_dir/$slug.jsonl", {
  runId => $run_id,
  scopeId => $scope_id,
  slug => $slug,
  startedAt => $started_at,
  finishedAt => $finished_at,
  durationMs => $duration_ms,
  status => $final_status,
  exitCode => $exit_code,
  error => $final_error,
  pid => $child_pid,
  logPath => $log_path,
});

unlink $lock_path;
print "\n=== Finished $finished_at status=$final_status exitCode=$exit_code durationMs=$duration_ms ===\n";
exit($exit_code);
`

function ensureSupervisorScript(): void {
  ensureDir(SCHEDULER_DIR)
  writeFileSync(SUPERVISOR_PATH, SUPERVISOR_SCRIPT)
  ensureRunnerScript()
}

const RUNNER_PATH = join(SCHEDULER_DIR, "runner.js")

/**
 * Copy the bundled `dist/runner.js` to a stable location under
 * `~/.config/opencode/scheduler/runner.js`. Supervisor invokes it via
 * a fixed path so backend entries (plist, systemd, cron) don't have to
 * embed the plugin's install-time path. Silently no-ops if the bundle
 * isn't present (e.g. dev mode without a build).
 */
function ensureRunnerScript(): void {
  try {
    const here = dirname(fileURLToPath(import.meta.url))
    const candidates = [
      join(here, "runner.js"), // built dist/runner.js sits next to dist/index.js
      join(here, "..", "dist", "runner.js"), // when import.meta is src/index.ts in dev
    ]
    for (const candidate of candidates) {
      if (existsSync(candidate)) {
        writeFileSync(RUNNER_PATH, readFileSync(candidate))
        return
      }
    }
  } catch {
    // Non-fatal: live delivery will be a no-op and supervisor will
    // fall through to the headless invocation as if the runner failed.
  }
}

// Job type

type OpencodeRunFormat = "default" | "json"

type SchedulerEnvMode = "snapshot" | "minimal" | "login-shell"

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
  mode?: SchedulerEnvMode
  exclude?: string[]
  set?: Record<string, string>
  /** @deprecated legacy v1.3 allowlist; ignored as of v1.4 */
  preserve?: string[]
  /** @deprecated legacy v1.3 toggle; ignored as of v1.4 */
  preserveOpencodeEnv?: boolean
}

type SchedulerConfig = {
  env?: SchedulerEnvConfig
}

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
  mode: SchedulerEnvMode
  snapshot?: Record<string, string>
}

/**
 * Scheduler-internal env keys that must NEVER appear in a job's snapshot.
 * Supervisor sets the OPENCODE_* keys per-run; the shell-internal keys
 * (PWD/OLDPWD/SHLVL/_) are not portable across processes anyway.
 */
const ENV_DENYLIST_INTERNAL: ReadonlySet<string> = new Set([
  "OPENCODE_PERMISSION",
  "OPENCODE_SCHEDULER_RUN_ID",
  "OLDPWD",
  "PWD",
  "SHLVL",
  "_",
])

const ENV_MINIMAL_KEYS: readonly string[] = ["PATH", "HOME", "USER", "SHELL"]

let warnedLegacyEnvKeys = false

function warnLegacyEnvKeysOnce(keys: string[]): void {
  if (warnedLegacyEnvKeys) return
  warnedLegacyEnvKeys = true
  console.warn(
    `[opencode-scheduler] config keys [${keys.join(", ")}] are deprecated and ignored as of v1.4. ` +
      `Use env.mode = 'snapshot' | 'minimal' | 'login-shell' and env.exclude / env.set instead.`
  )
}

/**
 * Build a denylist combining scheduler-internal keys and the user's
 * `env.exclude` extension.
 */
function buildEnvDenylist(extra?: string[]): Set<string> {
  const denylist = new Set(ENV_DENYLIST_INTERNAL)
  for (const key of extra ?? []) {
    const trimmed = key.trim()
    if (trimmed) denylist.add(trimmed)
  }
  return denylist
}

/**
 * Capture the current process env as a job-level snapshot.
 *
 * `mode='snapshot'` — copy of process.env minus the denylist; final overrides
 *                     applied from `set`.
 * `mode='minimal'`  — only PATH/HOME/USER/SHELL plus `set` overrides.
 * `mode='login-shell'` — same snapshot as 'snapshot'; the wrapping is applied
 *                        at invocation time (S3), not here.
 */
export function captureJobEnv(config?: SchedulerEnvConfig): JobEnv {
  const mode: SchedulerEnvMode = config?.mode ?? "snapshot"
  const denylist = buildEnvDenylist(config?.exclude)
  const snapshot: Record<string, string> = {}

  if (mode === "minimal") {
    for (const key of ENV_MINIMAL_KEYS) {
      const value = process.env[key]
      if (typeof value === "string" && value.length > 0) {
        snapshot[key] = value
      }
    }
  } else {
    for (const [key, value] of Object.entries(process.env)) {
      if (denylist.has(key)) continue
      if (typeof value !== "string") continue
      snapshot[key] = value
    }
  }

  // Apply explicit `set` overrides last; reject denylist keys.
  for (const [key, value] of Object.entries(config?.set ?? {})) {
    if (denylist.has(key)) continue
    snapshot[key] = String(value)
  }

  // PATH is special: it is the bootstrap-critical key needed for
  // /usr/bin/env to resolve node/perl/etc. We guarantee it is present
  // even if the caller put "PATH" in `exclude` or used mode='minimal'
  // with no PATH in process.env. Document this invariant — `exclude`
  // does NOT apply to PATH.
  if (!snapshot.PATH) {
    snapshot.PATH = getEnhancedPath({ withTerminalPath: true })
  }

  return { mode, snapshot }
}

interface JobRunSpec {
  prompt?: string
  command?: string
  arguments?: string

  files?: string[]
  agent?: string
  model?: string
  variant?: string
  title?: string
  share?: boolean
  continue?: boolean
  session?: string
  runFormat?: OpencodeRunFormat

  attachUrl?: string
  port?: number
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
type SessionPolicy = "current" | "existing" | "new-per-job" | "new-per-run"

/**
 * Where the scheduler tries to deliver the prompt at fire-time.
 *
 * - `prefer-live-server` — try live HTTP delivery first, fall back to
 *                          headless `opencode run` if no server reachable.
 * - `headless-only`      — never attempt live HTTP; always spawn a CLI.
 */
type ExecutionPolicy = "prefer-live-server" | "headless-only"

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
type DeliveryPolicy = "execute" | "leave-message"

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
export type ScheduledPermissionRule = { permission: string; action: "deny"; pattern: string }
const SCHEDULED_PERMS: readonly ScheduledPermissionRule[] = [
  { permission: "question", action: "deny", pattern: "*" },
  { permission: "plan_enter", action: "deny", pattern: "*" },
  { permission: "plan_exit", action: "deny", pattern: "*" },
]

type JobInvocation = {
  command: string
  args: string[]
}

interface Job {
  // Scope isolates jobs per opencode "owner" (usually the workspace workdir).
  // Jobs scheduled from different workdirs should not collide.
  scopeId?: string

  slug: string
  name: string
  schedule: string

  // Legacy fields (kept for backward compatibility)
  prompt?: string
  attachUrl?: string

  // Preferred run specification (maps to `opencode run` flags)
  run?: JobRunSpec

  // Snapshot of the command line the OS scheduler should execute.
  // This keeps scheduled runs stable even if run/prompt is updated.
  invocation?: JobInvocation

  /**
   * Per-job env snapshot persisted at schedule-time. Supervisor merges
   * `env.snapshot` into the run env before scheduler-only keys
   * (OPENCODE_PERMISSION, OPENCODE_SCHEDULER_RUN_ID).
   *
   * Legacy jobs without this field fall back to mode='minimal' at
   * supervisor time with a one-line warning to recreate the job.
   */
  env?: JobEnv

  /**
   * Headless-mode invocation snapshot, built at schedule-time without
   * `--attach`. Used by the runner as the fallback path when live HTTP
   * delivery fails (S5).
   */
  headlessInvocation?: JobInvocation

  /**
   * Persisted session policy chosen at schedule-time. The runner uses
   * this at fire-time to decide whether to create a new session
   * (`new-per-run`) or use the persisted `run.session`.
   */
  sessionPolicy?: SessionPolicy
  executionPolicy?: ExecutionPolicy
  deliveryPolicy?: DeliveryPolicy

  // Reliability knobs (optional)
  timeoutSeconds?: number

  source?: string
  workdir?: string
  createdAt: string
  updatedAt?: string
  lastRunAt?: string
  lastRunExitCode?: number
  lastRunError?: string
  lastRunSource?: "manual" | "scheduled"
  lastRunStatus?: "running" | "success" | "failed"
}

type OutputFormat = "text" | "json"

interface ToolResult<T = unknown> {
  success: boolean
  output: string
  shouldContinue: boolean
  data?: T
}

function normalizeFormat(format?: string): OutputFormat {
  return format === "json" ? "json" : "text"
}

function formatToolResult<T>(format: OutputFormat, result: ToolResult<T>): string {
  return format === "json" ? JSON.stringify(result, null, 2) : result.output
}

function okResult<T>(format: OutputFormat, output: string, data?: T): string {
  return formatToolResult(format, { success: true, output, shouldContinue: false, data })
}

function errorResult<T>(format: OutputFormat, output: string, data?: T): string {
  return formatToolResult(format, { success: false, output, shouldContinue: true, data })
}

// === Built-in Skills ===

interface BuiltinSkill {
  name: string
  description: string
  suggestedPath: string
  files: Record<string, string>
}

const SCHEDULED_JOB_BEST_PRACTICES_SKILL: BuiltinSkill = {
  name: "scheduled-job-best-practices",
  description: "Patterns for resilient, non-interactive scheduled opencode jobs",
  suggestedPath: ".opencode/skill/scheduled-job-best-practices/SKILL.md",
  files: {
    "SKILL.md": `---
name: scheduled-job-best-practices
description: Patterns for resilient, non-interactive scheduled opencode jobs
---

## Use This Skill

Put this line at the very top of any scheduled job prompt:

@scheduled-job-best-practices

Then write your task below it.

## Core Principles

1. **No magic injection.** Do not assume placeholders like __TODAY__ exist. Compute runtime values using tools (bash) during the run.
2. **Non-interactive.** Scheduled jobs must not rely on QR codes, manual logins, or confirmation dialogs.
3. **Idempotent.** Make reruns safe (maintain a seen/state file; avoid duplicate messages).
4. **Observable.** Print a short summary at the end with status + outputs.
5. **Minimal side effects.** Write durable artifacts under outputs/ in the job workdir.

## Choosing a Session Policy

\`schedule_job\` REQUIRES an explicit \`sessionPolicy\` — there is no default.
Always ask the user which one fits their intent before scheduling; a silent
default leads to silent failures (job runs, TUI never refreshes). Pick by
what you want the run to feel like in the TUI:

| Policy          | When                                                                                  | Effect                                                                                 |
| --------------- | ------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| \`current\`     | "Stream into the chat where I'm scheduling from."                                     | Uses the calling tool's session. Permission rules of that session are unchanged.       |
| \`existing\`    | "Stream into a specific session I created earlier."                                   | Requires explicit \`sessionId\`. Session permissions unchanged.                        |
| \`new-per-job\` | "One fresh session that all fires of this job append to."                             | Plugin creates the session at schedule-time with auto-deny on \`question\`/\`plan_*\`. |
| \`new-per-run\` | "Each fire gets its own brand-new session."                                           | Runner creates a session per fire with the same auto-deny permissions.                 |

Notes:

- \`current\` and \`existing\` do NOT mutate session permissions — if the
  session was created interactively, it can still ask questions. Pick
  \`new-per-job\` / \`new-per-run\` when you need guaranteed silence.
- An explicit \`sessionId\` beats the calling-tool session: passing both is
  treated as "use this id".

## Delivery and Execution Policies

Two orthogonal flags control what the job actually does at fire time:

- \`executionPolicy\` (default: \`headless-then-attach\`):
  - \`headless-then-attach\` — run the prompt headlessly first, then attach
    output to the target session. Default.
  - \`headless-only\` — never attach. Use for non-interactive workers that
    only need to write artifacts.
- \`deliveryPolicy\` (default: \`execute\`):
  - \`execute\` — actually run the job. Normal mode.
  - \`leave-message\` — do NOT execute the prompt; only post a notification
    message into the session. Pair with an \`existing\`/\`current\` session
    so the user sees it.

\`leave-message\` skips execution entirely; only set it when you really
just want a heads-up dropped into a session.

## Auto-Permissions for new-per-* Sessions

When the plugin creates a session for you (\`new-per-job\` or
\`new-per-run\`), it bakes in:

- \`question\`     → \`deny\` for \`*\`
- \`plan_enter\`   → \`deny\` for \`*\`
- \`plan_exit\`    → \`deny\` for \`*\`

This is enforced server-side, so the model cannot stall the run by asking
for confirmation or entering plan mode. There is no public \`PATCH\` route
to mutate an existing session's permissions, which is why \`current\` /
\`existing\` are not modified.

## Env Parity

At schedule-time the plugin captures the **full terminal env** as a
per-job snapshot, minus a small denylist
(\`OPENCODE_PERMISSION\`, \`OPENCODE_SCHEDULER_RUN_ID\`, \`OLDPWD\`,
\`PWD\`, \`SHLVL\`, \`_\`). The snapshot lives in \`job.json\`; the OS
scheduler entry (launchd plist, systemd unit, cron preamble) only
gets the bootstrap env (\`PATH\`, \`HOME\`, \`USER\`, \`SHELL\`).
\`supervisor.pl\` merges the full snapshot back into \`%ENV\` before
exec.

What this fixes:

- \`env: node: No such file or directory\` on hosts using NVM / asdf /
  mise / Volta / Bun without baking only PATH.
- Lost MCP / plugin tokens (\`OPENCODE_API_KEY\`, MCP server credentials,
  etc.) — they carry over because the snapshot is full.

You do not have to do anything in the prompt. If a particular env var
should NOT be carried, scrub it from the calling shell BEFORE running
\`schedule_job\`, or extend the denylist in your \`.opencode/config\` env
section.

## Remote Sessions (attachUrl)

To run against a remote opencode server, pass \`attachUrl\`. The plugin
will use REST against that URL for both session creation
(\`new-per-job\`) and verification (\`current\` / \`existing\`). Without
\`attachUrl\`, all session work goes through the in-process plugin
client, which does NOT need an open HTTP port.

At fire-time, when the job has no persisted \`attachUrl\`, the runner
also consults the F5 plugin-side runtime registry
(\`~/.local/share/opencode/runtime/<pid>.json\`). Every opencode that
loads this plugin and is reachable externally publishes its own
entry there, so a sibling TUI launched with \`--port\` can become the
delivery target automatically — you only need to pass \`attachUrl\`
explicitly for cross-host or otherwise non-discoverable targets.

To make every opencode start register itself automatically (without
adding \`--port\` to every shell alias), run \`install_server_config\`
once. It writes \`server.port: 0\` (= try 4096, then OS-assigned
random) into \`~/.config/opencode/opencode.json\`. The tool is
two-step (preview → confirm) and idempotent — see README.

## Runtime Values: Dates

If you need local dates, compute them at runtime.

### macOS

~~~bash
TODAY="$(date +%F)"
TOMORROW="$(date -v+1d +%F)"
~~~

### Linux

~~~bash
TODAY="$(date +%F)"
TOMORROW="$(date -d 'tomorrow' +%F)"
~~~

### Portable snippet

~~~bash
if [ "$(uname)" = "Darwin" ]; then
  TODAY="$(date +%F)"
  TOMORROW="$(date -v+1d +%F)"
else
  TODAY="$(date +%F)"
  TOMORROW="$(date -d 'tomorrow' +%F)"
fi
~~~

If timezone matters, set TZ explicitly (example: TZ=America/Los_Angeles date +%F).

## Preflight Checklist

Before doing any expensive work:

- Confirm required tools are available (browser, network, etc).
- Confirm required env vars exist (source .env only if needed).
- If a dependency is missing/offline, stop early and emit a single concise reason.

## Notifications (Telegram)

Prefer the Telegram Bot API (non-interactive) over web.telegram.org.

## Output Contract

End every run with a compact summary:

- Status: success | skipped | failed
- Reason (1 line)
- Outputs written (paths)
- Notifications sent (message_id, chat_id) if applicable

## Idempotency Pattern

When notifying about “new” items (deals, alerts, etc.):

- Store a seen list in outputs/<job>/seen.json
- Only notify on items not in seen.json
- Update seen.json after sending
`,
  },
}

const BUILTIN_SKILLS: Record<string, BuiltinSkill> = {
  [SCHEDULED_JOB_BEST_PRACTICES_SKILL.name]: SCHEDULED_JOB_BEST_PRACTICES_SKILL,
}

const SKILL_ALIASES: Record<string, string> = {
  "job-best-practices": SCHEDULED_JOB_BEST_PRACTICES_SKILL.name,
  "scheduled-jobs": SCHEDULED_JOB_BEST_PRACTICES_SKILL.name,
  scheduler: SCHEDULED_JOB_BEST_PRACTICES_SKILL.name,
}

function normalizeSkillName(name?: string): string {
  const trimmed = (name ?? "").trim()
  if (!trimmed) return SCHEDULED_JOB_BEST_PRACTICES_SKILL.name
  return SKILL_ALIASES[trimmed] ?? trimmed
}

function getBuiltinSkill(name?: string): BuiltinSkill | undefined {
  return BUILTIN_SKILLS[normalizeSkillName(name)]
}

function listBuiltinSkills(): BuiltinSkill[] {
  return Object.values(BUILTIN_SKILLS)
}

function installBuiltinSkill(skill: BuiltinSkill, rootDir: string, overwrite = false): { directory: string; files: string[] } {
  const installRoot = rootDir.trim()
  if (!installRoot) {
    throw new Error("Install directory cannot be empty.")
  }

  if (!existsSync(installRoot)) {
    throw new Error(`Directory not found: ${installRoot}`)
  }

  const relativeDir = dirname(skill.suggestedPath)
  const installDir = join(installRoot, relativeDir)
  ensureDir(installDir)

  const files: string[] = []
  for (const [filename, content] of Object.entries(skill.files)) {
    const targetPath = join(installDir, filename)
    if (existsSync(targetPath) && !overwrite) {
      throw new Error(`File already exists: ${targetPath} (pass overwrite=true to replace)`)
    }
    writeFileSync(targetPath, `${content.trimEnd()}\n`)
    files.push(targetPath)
  }

  return { directory: installDir, files }
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
export function ensureBestPracticesSkill(workdir: string): {
  status: "present" | "installed" | "failed"
  path: string
  reason?: string
} {
  const skill = SCHEDULED_JOB_BEST_PRACTICES_SKILL
  // The fast presence check below assumes a single-file skill so we don't
  // have to stat every entry. Assert that invariant — adding a second file
  // to skill.files without revisiting this function would silently skip
  // the new file when SKILL.md is already present.
  if (Object.keys(skill.files).length !== 1) {
    throw new Error(
      `ensureBestPracticesSkill assumes a single-file skill; ${skill.name} now has ${Object.keys(skill.files).length} files. Update the presence check before adding more.`,
    )
  }
  const expectedPath = join(workdir, skill.suggestedPath)
  if (existsSync(expectedPath)) {
    return { status: "present", path: expectedPath }
  }
  try {
    installBuiltinSkill(skill, workdir, false)
    return { status: "installed", path: expectedPath }
  } catch (error) {
    return {
      status: "failed",
      path: expectedPath,
      reason: error instanceof Error ? error.message : String(error),
    }
  }
}

function loadPackageInfo(): { name: string; version: string } {
  const fallback = { name: "opencode-scheduler", version: "unknown" }
  try {
    const packagePath = join(dirname(fileURLToPath(import.meta.url)), "..", "package.json")
    const raw = readFileSync(packagePath, "utf-8")
    const parsed = JSON.parse(raw) as { name?: string; version?: string }
    return {
      name: typeof parsed.name === "string" ? parsed.name : fallback.name,
      version: typeof parsed.version === "string" ? parsed.version : fallback.version,
    }
  } catch {
    return fallback
  }
}

// Find opencode binary
function findOpencode(): string {
  // Allow explicit override for edge cases (multiple installs, etc.)
  const override = process.env.OPENCODE_SCHEDULER_OPENCODE_PATH?.trim()
  if (override) return override

  // Prefer PATH resolution so the scheduler uses the same `opencode` as the user.
  // This fixes cases where an old install exists at ~/.opencode/bin/opencode.
  // findOpencode's invariant: fallback paths come first; terminal PATH only as
  // a last resort. Hence withTerminalPath: false here.
  try {
    const resolved = execSync("command -v opencode", {
      env: { ...process.env, PATH: getEnhancedPath({ withTerminalPath: false }) + ":" + (process.env.PATH ?? "") },
      stdio: ["ignore", "pipe", "ignore"],
    })
      .toString()
      .trim()

    if (resolved) {
      // If command -v returns a path, prefer it.
      if (resolved.includes("/")) return resolved
      // Fallback: let the OS resolve via PATH at runtime.
      return "opencode"
    }
  } catch {
    // ignore
  }

  // Fallbacks (common install locations)
  const paths = [
    "/opt/homebrew/bin/opencode",
    "/usr/local/bin/opencode",
    join(homedir(), ".opencode", "bin", "opencode"),
  ]

  for (const p of paths) {
    if (existsSync(p)) {
      return p
    }
  }

  return "opencode" // hope it's in PATH
}

// Get PATH that includes common locations for node/npx.
//
// `withTerminalPath: true` (default) prepends the current process.env.PATH
// (i.e. the terminal PATH where the scheduler was invoked) before the
// hardcoded fallback list. This is what OS scheduler entries should use,
// because the user's terminal PATH typically carries NVM/asdf/mise/Volta/Bun
// shims that the static fallback misses.
//
// `withTerminalPath: false` returns only the static fallback list. Useful
// for `findOpencode()` whose explicit invariant is "fallback first, terminal
// PATH only as the very last resort".
export function getEnhancedPath(options?: { withTerminalPath?: boolean }): string {
  const fallback = [
    "/opt/homebrew/bin",
    "/usr/local/bin",
    "/usr/bin",
    "/bin",
    "/usr/sbin",
    "/sbin",
  ]
  const withTerminal = options?.withTerminalPath !== false
  const terminal = withTerminal ? (process.env.PATH ?? "").split(":").filter(Boolean) : []
  const seen = new Set<string>()
  const merged: string[] = []
  for (const entry of [...terminal, ...fallback]) {
    if (!entry) continue
    if (seen.has(entry)) continue
    seen.add(entry)
    merged.push(entry)
  }
  return merged.join(":")
}

function splitCronExpression(cron: string): [string, string, string, string, string] {
  const parts = cron.trim().split(/\s+/)
  if (parts.length !== 5) {
    throw new Error(`Invalid cron: ${cron}`)
  }
  return parts as [string, string, string, string, string]
}

function uniqueSorted(values: number[]): number[] {
  return Array.from(new Set(values)).sort((a, b) => a - b)
}

function parseCronField(
  field: string,
  min: number,
  max: number,
  label: string,
  allowSundaySeven = false
): number[] | null {
  if (field === "*") return null

  if (field.startsWith("*/")) {
    const step = parseInt(field.slice(2), 10)
    if (!Number.isFinite(step) || step <= 0) {
      throw new Error(`Invalid cron ${label} step: ${field}`)
    }
    const values: number[] = []
    for (let value = min; value <= max; value += step) {
      values.push(value)
    }
    return values
  }

  const parts = field.split(",")
  if (parts.length > 1) {
    const values = parts.map((part) => parseCronNumber(part, min, max, label, allowSundaySeven))
    return uniqueSorted(values)
  }

  if (/^\d+$/.test(field)) {
    return [parseCronNumber(field, min, max, label, allowSundaySeven)]
  }

  throw new Error(`Invalid cron ${label} field: ${field}`)
}

function parseCronNumber(
  value: string,
  min: number,
  max: number,
  label: string,
  allowSundaySeven: boolean
): number {
  const parsed = parseInt(value, 10)
  if (!Number.isFinite(parsed)) {
    throw new Error(`Invalid cron ${label} value: ${value}`)
  }
  const normalized = allowSundaySeven && parsed === 7 ? 0 : parsed
  if (normalized < min || normalized > max) {
    throw new Error(`Invalid cron ${label} value: ${value}`)
  }
  return normalized
}

function validateCronExpression(cron: string): void {
  const [minute, hour, dayOfMonth, month, dayOfWeek] = splitCronExpression(cron)
  parseCronField(minute, 0, 59, "minute")
  parseCronField(hour, 0, 23, "hour")
  parseCronField(dayOfMonth, 1, 31, "day of month")
  parseCronField(month, 1, 12, "month")
  parseCronField(dayOfWeek, 0, 7, "day of week", true)
}

function expandLaunchdEntries(
  entries: Record<string, number>[],
  key: string,
  values: number[] | null
): Record<string, number>[] {
  if (!values) return entries
  const expanded: Record<string, number>[] = []
  for (const entry of entries) {
    for (const value of values) {
      expanded.push({ ...entry, [key]: value })
    }
  }
  return expanded
}

function buildLaunchdCalendars(
  minuteValues: number[] | null,
  hourValues: number[] | null,
  dayValues: number[] | null,
  monthValues: number[] | null,
  weekdayValues: number[] | null
): Record<string, number>[] {
  let entries: Record<string, number>[] = [{}]
  entries = expandLaunchdEntries(entries, "Minute", minuteValues)
  entries = expandLaunchdEntries(entries, "Hour", hourValues)
  entries = expandLaunchdEntries(entries, "Day", dayValues)
  entries = expandLaunchdEntries(entries, "Month", monthValues)
  entries = expandLaunchdEntries(entries, "Weekday", weekdayValues)
  return entries
}

function cronToLaunchdCalendars(cron: string): Record<string, number>[] {
  const [minute, hour, dayOfMonth, month, dayOfWeek] = splitCronExpression(cron)
  const minuteValues = parseCronField(minute, 0, 59, "minute")
  const hourValues = parseCronField(hour, 0, 23, "hour")
  const dayValues = parseCronField(dayOfMonth, 1, 31, "day of month")
  const monthValues = parseCronField(month, 1, 12, "month")
  const weekdayValues = parseCronField(dayOfWeek, 0, 7, "day of week", true)

  if (dayValues && weekdayValues) {
    return [
      ...buildLaunchdCalendars(minuteValues, hourValues, dayValues, monthValues, null),
      ...buildLaunchdCalendars(minuteValues, hourValues, null, monthValues, weekdayValues),
    ]
  }

  return buildLaunchdCalendars(minuteValues, hourValues, dayValues, monthValues, weekdayValues)
}

function escapePlistString(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
}

function escapeSystemdArg(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/"/g, '\\"')
}

/**
 * Bootstrap-only env keys that must be present in the OS-scheduler entry
 * itself (launchd plist / systemd unit / cron line) so that:
 *
 *   1. `/usr/bin/env node` can locate `node` (PATH).
 *   2. `/usr/bin/perl` finds `$HOME` for log paths.
 *   3. supervisor.pl reports the user identity correctly (USER, SHELL).
 *
 * Everything else lives in `job.env.snapshot` (the per-job JSON file)
 * and is merged into `%ENV` by supervisor.pl before exec'ing the actual
 * command. This keeps unit files / cron lines small (cron has a
 * historical line-length limit on some impls), avoids redundancy, and
 * makes job.json the single source of truth for runtime env.
 */
const ENV_BOOTSTRAP_KEYS: readonly string[] = ["PATH", "HOME", "USER", "SHELL"]

/**
 * Pick the bootstrap-env subset from a job's snapshot, with PATH
 * overridden by the caller-supplied terminal-first PATH. Falls back to
 * `process.env` for missing keys (covers legacy jobs without snapshot).
 */
export function pickBootstrapEnv(job: Job, terminalPath: string): Record<string, string> {
  const out: Record<string, string> = {}
  const snapshot = job.env?.snapshot
  for (const key of ENV_BOOTSTRAP_KEYS) {
    const fromSnap = snapshot?.[key]
    const fromProc = process.env[key]
    const value = fromSnap ?? fromProc
    if (typeof value === "string" && value.length > 0) {
      out[key] = value
    }
  }
  out.PATH = terminalPath // always the terminal-first PATH
  return out
}

/**
 * Build the EnvironmentVariables dict for a launchd plist (bootstrap-only).
 */
function renderLaunchdEnvDict(job: Job, terminalPath: string): string {
  const entries = pickBootstrapEnv(job, terminalPath)
  return Object.keys(entries)
    .sort()
    .map((key) => `    <key>${escapePlistString(key)}</key>\n    <string>${escapePlistString(entries[key] ?? "")}</string>`)
    .join("\n")
}

/**
 * Build `Environment="K=V"` lines for a systemd service (bootstrap-only).
 */
function renderSystemdEnvLines(job: Job, terminalPath: string): string {
  const entries = pickBootstrapEnv(job, terminalPath)
  return Object.keys(entries)
    .sort()
    .map((key) => `Environment="${escapeSystemdArg(key)}=${escapeSystemdArg(entries[key] ?? "")}"`)
    .join("\n")
}

/**
 * Inline `K1="V1" K2="V2" ...` env preamble for a cron line (bootstrap-only).
 * Keeping this minimal protects against historical 1KB cron line-length
 * limits on some implementations (vixie-cron).
 */
function renderCronEnvPreamble(job: Job, terminalPath: string): string {
  const entries = pickBootstrapEnv(job, terminalPath)
  return Object.keys(entries)
    .sort()
    .map((key) => `${key}="${shellEscapeDoubleQuoted(entries[key] ?? "")}"`)
    .join(" ")
}

function renderLaunchdCalendar(calendar: Record<string, number>): string {
  return Object.entries(calendar)
    .map(([key, value]) => `    <key>${key}</key>\n    <integer>${value}</integer>`)
    .join("\n")
}

const SYSTEMD_WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

function formatSystemdValue(value: number, size: number): string {
  return value.toString().padStart(size, "0")
}

function cronToSystemdCalendars(cron: string): string[] {
  const [minute, hour, dayOfMonth, month, dayOfWeek] = splitCronExpression(cron)
  const minuteValues = parseCronField(minute, 0, 59, "minute")
  const hourValues = parseCronField(hour, 0, 23, "hour")
  const dayValues = parseCronField(dayOfMonth, 1, 31, "day of month")
  const monthValues = parseCronField(month, 1, 12, "month")
  const weekdayValues = parseCronField(dayOfWeek, 0, 7, "day of week", true)

  const minutes = minuteValues ? minuteValues.map((value) => formatSystemdValue(value, 2)) : ["*"]
  const hours = hourValues ? hourValues.map((value) => formatSystemdValue(value, 2)) : ["*"]
  const days = dayValues ? dayValues.map((value) => formatSystemdValue(value, 2)) : ["*"]
  const months = monthValues ? monthValues.map((value) => formatSystemdValue(value, 2)) : ["*"]
  const weekdays = weekdayValues
    ? weekdayValues.map((value) => SYSTEMD_WEEKDAYS[value] ?? "*")
    : ["*"]

  const calendars: string[] = []

  const buildCalendars = (domValues: string[], dowValues: string[]) => {
    for (const minuteValue of minutes) {
      for (const hourValue of hours) {
        for (const domValue of domValues) {
          for (const monthValue of months) {
            for (const dowValue of dowValues) {
              calendars.push(`${dowValue} *-${monthValue}-${domValue} ${hourValue}:${minuteValue}:00`)
            }
          }
        }
      }
    }
  }

  if (dayValues && weekdayValues) {
    buildCalendars(days, ["*"])
    buildCalendars(["*"], weekdays)
  } else {
    buildCalendars(days, weekdays)
  }

  return calendars
}

const WINDOWS_WEEKDAYS = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
const WINDOWS_MONTHS = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]

interface WindowsTaskDefinition {
  name: string
  args: string[]
}

interface WindowsCronPlan {
  schedule: "MINUTE" | "HOURLY" | "DAILY" | "WEEKLY" | "MONTHLY"
  modifier?: string
  weekdays?: string
  days?: string
  months?: string
  startTime: string
}

function pad2(value: number): string {
  return value.toString().padStart(2, "0")
}

function formatStartTime(hour: number, minute: number): string {
  return `${pad2(hour)}:${pad2(minute)}`
}

function windowsTaskBaseName(job: Job): string {
  const scopeId = job.scopeId || deriveScopeId(job.workdir || homedir())
  return `${WINDOWS_TASK_PREFIX}-${scopeId}-${job.slug}`
}

function windowsTaskName(baseName: string, index: number, total: number): string {
  const suffix = total > 1 ? `-${index + 1}` : ""
  return `${WINDOWS_TASK_ROOT}\\${baseName}${suffix}`
}

function quoteWindowsArg(value: string): string {
  if (!/[\s"]/u.test(value)) return value
  return `"${value.replace(/"/g, '""')}"`
}

function getWindowsInvocation(job: Job): JobInvocation {
  const invocation = job.invocation ?? buildOpencodeArgs(job)
  return invocation
}

function buildWindowsTaskCommand(job: Job): string {
  const invocation = getWindowsInvocation(job)
  return [invocation.command, ...invocation.args].map((arg) => quoteWindowsArg(arg)).join(" ")
}

function maybeStep(field: string): number | null {
  const match = field.match(/^\*\/(\d+)$/)
  if (!match) return null
  const step = parseInt(match[1], 10)
  return Number.isFinite(step) && step > 0 ? step : null
}

function ensureWindowsRepresentable(cron: string): WindowsCronPlan[] {
  const [minuteField, hourField, dayField, monthField, weekdayField] = splitCronExpression(cron)

  const minuteStep = maybeStep(minuteField)
  const hourStep = maybeStep(hourField)

  if (minuteField === "*" && hourField === "*" && dayField === "*" && monthField === "*" && weekdayField === "*") {
    return [{ schedule: "MINUTE", modifier: "1", startTime: "00:00" }]
  }

  if (minuteStep !== null && hourField === "*" && dayField === "*" && monthField === "*" && weekdayField === "*") {
    if (minuteStep > 1439) {
      throw new Error(
        `Windows Task Scheduler supports at most every 1439 minutes. Use ${minuteStep} with a smaller value or switch to an hourly/daily cron.`
      )
    }
    return [{ schedule: "MINUTE", modifier: String(minuteStep), startTime: "00:00" }]
  }

  const minuteValues = parseCronField(minuteField, 0, 59, "minute")
  const hourValues = parseCronField(hourField, 0, 23, "hour")
  const dayValues = parseCronField(dayField, 1, 31, "day of month")
  const monthValues = parseCronField(monthField, 1, 12, "month")
  const weekdayValues = parseCronField(weekdayField, 0, 7, "day of week", true)

  if (hourStep !== null && minuteValues && minuteValues.length === 1 && dayField === "*" && monthField === "*" && weekdayField === "*") {
    return [{ schedule: "HOURLY", modifier: String(hourStep), startTime: formatStartTime(0, minuteValues[0]) }]
  }

  if (!minuteValues || minuteValues.length === 0 || !hourValues || hourValues.length === 0) {
    throw new Error(
      "Windows Task Scheduler requires explicit minute and hour values for this cron expression. Use formats like '0 9 * * *', '30 8 * * 1', '*/15 * * * *', or '0 */6 * * *'."
    )
  }

  if (monthValues && weekdayValues) {
    throw new Error(
      "Windows Task Scheduler cannot combine specific months with day-of-week constraints in cron. Split this into multiple jobs (for example: one monthly job and one weekly job)."
    )
  }

  if (monthValues && !dayValues) {
    throw new Error(
      "Windows Task Scheduler cannot represent 'every day in selected months'. Use explicit day-of-month values (for example '0 9 1,15 1,7 *') or create separate jobs."
    )
  }

  const plans: WindowsCronPlan[] = []
  for (const minute of minuteValues) {
    for (const hour of hourValues) {
      const startTime = formatStartTime(hour, minute)

      if (dayValues && weekdayValues) {
        plans.push({
          schedule: "MONTHLY",
          days: dayValues.join(","),
          months: monthValues ? monthValues.map((value) => WINDOWS_MONTHS[value - 1]).join(",") : undefined,
          startTime,
        })
        plans.push({
          schedule: "WEEKLY",
          weekdays: weekdayValues.map((value) => WINDOWS_WEEKDAYS[value]).join(","),
          startTime,
        })
      } else if (weekdayValues) {
        plans.push({
          schedule: "WEEKLY",
          weekdays: weekdayValues.map((value) => WINDOWS_WEEKDAYS[value]).join(","),
          startTime,
        })
      } else if (dayValues) {
        plans.push({
          schedule: "MONTHLY",
          days: dayValues.join(","),
          months: monthValues ? monthValues.map((value) => WINDOWS_MONTHS[value - 1]).join(",") : undefined,
          startTime,
        })
      } else if (monthValues) {
        throw new Error(
          "Windows Task Scheduler cannot represent month-only cron constraints without day-of-month. Use explicit days or create separate jobs."
        )
      } else {
        plans.push({ schedule: "DAILY", startTime })
      }
    }
  }

  return plans
}

function cronToWindowsTaskDefinitions(job: Job): WindowsTaskDefinition[] {
  const plans = ensureWindowsRepresentable(job.schedule)
  const baseName = windowsTaskBaseName(job)
  const command = buildWindowsTaskCommand(job)

  return plans.map((plan, index) => {
    const args = ["/Create", "/F", "/TN", windowsTaskName(baseName, index, plans.length), "/TR", command, "/SC", plan.schedule]

    if (plan.modifier) {
      args.push("/MO", plan.modifier)
    }

    if (plan.weekdays) {
      args.push("/D", plan.weekdays)
    }

    if (plan.days) {
      args.push("/D", plan.days)
    }

    if (plan.months) {
      args.push("/M", plan.months)
    }

    args.push("/ST", plan.startTime)
    return { name: windowsTaskName(baseName, index, plans.length), args }
  })
}

// === LAUNCHD (Mac) ===

function createLaunchdPlist(job: Job): string {
  const scopeId = job.scopeId || deriveScopeId(job.workdir || homedir())
  const label = `${LAUNCHD_PREFIX}.${scopeId}.${job.slug}`
  const logFilePath = scopedLogPath(scopeId, job.slug)
  const jobPath = jobFilePath(scopeId, job.slug)

  const calendars = cronToLaunchdCalendars(job.schedule)
  const calendarXml =
    calendars.length === 1
      ? `  <dict>\n${renderLaunchdCalendar(calendars[0])}\n  </dict>`
      : `  <array>\n${calendars
          .map((calendar) => `  <dict>\n${renderLaunchdCalendar(calendar)}\n  </dict>`)
          .join("\n")}\n  </array>`

  const programArgumentsXml = [
    `    <string>${escapePlistString("/usr/bin/perl")}</string>`,
    `    <string>${escapePlistString(SUPERVISOR_PATH)}</string>`,
    `    <string>${escapePlistString(jobPath)}</string>`,
  ].join("\n")

  // Use workdir if specified, otherwise default to home directory
  const workdir = job.workdir || homedir()
  const enhancedPath = getEnhancedPath()
  const envDict = renderLaunchdEnvDict(job, enhancedPath)

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Label</key>
  <string>${label}</string>
  
  <key>WorkingDirectory</key>
  <string>${escapePlistString(workdir)}</string>
  
  <key>EnvironmentVariables</key>
  <dict>
${envDict}
  </dict>
  
  <key>ProgramArguments</key>
  <array>
${programArgumentsXml}
  </array>
  
  <key>StartCalendarInterval</key>
${calendarXml}
  
  <key>StandardOutPath</key>
  <string>${logFilePath}</string>
  
  <key>StandardErrorPath</key>
  <string>${logFilePath}</string>
  
  <key>RunAtLoad</key>
  <false/>
</dict>
</plist>`
}


function installLaunchdJob(job: Job): void {
  ensureDir(LAUNCH_AGENTS_DIR)
  ensureDir(LOGS_DIR)

  const scopeId = job.scopeId || deriveScopeId(job.workdir || homedir())
  ensureDir(scopeLogsDir(scopeId))
  ensureSupervisorScript()

  const legacyLabel = `${LAUNCHD_PREFIX}.${job.slug}`
  const legacyPlistPath = join(LAUNCH_AGENTS_DIR, `${legacyLabel}.plist`)

  const label = `${LAUNCHD_PREFIX}.${scopeId}.${job.slug}`
  const plistPath = join(LAUNCH_AGENTS_DIR, `${label}.plist`)

  // Unload if exists
  try {
    execSync(`launchctl unload "${plistPath}" 2>/dev/null`, { stdio: "ignore" })
  } catch {}

  // Also unload legacy label (pre-scope)
  if (existsSync(legacyPlistPath)) {
    try {
      execSync(`launchctl unload "${legacyPlistPath}" 2>/dev/null`, { stdio: "ignore" })
    } catch {}
  }

  // Write plist
  const plist = createLaunchdPlist(job)
  writeFileSync(plistPath, plist)

  // Load
  execSync(`launchctl load "${plistPath}"`)
}

function uninstallLaunchdJob(job: Job): void {
  const scopeId = job.scopeId || deriveScopeId(job.workdir || homedir())
  const scopedLabel = `${LAUNCHD_PREFIX}.${scopeId}.${job.slug}`
  const scopedPlistPath = join(LAUNCH_AGENTS_DIR, `${scopedLabel}.plist`)

  const legacyLabel = `${LAUNCHD_PREFIX}.${job.slug}`
  const legacyPlistPath = join(LAUNCH_AGENTS_DIR, `${legacyLabel}.plist`)

  for (const plistPath of [scopedPlistPath, legacyPlistPath]) {
    if (!existsSync(plistPath)) continue
    try {
      execSync(`launchctl unload "${plistPath}"`, { stdio: "ignore" })
    } catch {}
    try {
      unlinkSync(plistPath)
    } catch {}
  }
}

// === SYSTEMD (Linux) ===

function createSystemdService(job: Job): string {
  const scopeId = job.scopeId || deriveScopeId(job.workdir || homedir())
  const logFilePath = scopedLogPath(scopeId, job.slug)
  const jobPath = jobFilePath(scopeId, job.slug)
  const workdir = job.workdir || homedir()
  const enhancedPath = getEnhancedPath()
  const envLines = renderSystemdEnvLines(job, enhancedPath)

  const execStart = ["/usr/bin/perl", SUPERVISOR_PATH, jobPath]
    .map((arg) => `"${escapeSystemdArg(arg)}"`)
    .join(" ")

  return `[Unit]
Description=OpenCode Job: ${job.name}

[Service]
Type=oneshot
WorkingDirectory=${workdir}
${envLines}
ExecStart=${execStart}
StandardOutput=append:${logFilePath}
StandardError=append:${logFilePath}

[Install]
WantedBy=default.target
`
}

function createSystemdTimer(job: Job): string {
  const calendars = cronToSystemdCalendars(job.schedule)
  const calendarLines = calendars.map((calendar) => `OnCalendar=${calendar}`).join("\n")

  return `[Unit]
Description=Timer for OpenCode Job: ${job.name}

[Timer]
${calendarLines}
Persistent=true

[Install]
WantedBy=timers.target
`
}

function installSystemdJob(job: Job): void {
  ensureDir(SYSTEMD_USER_DIR)
  ensureDir(LOGS_DIR)

  const scopeId = job.scopeId || deriveScopeId(job.workdir || homedir())
  ensureDir(scopeLogsDir(scopeId))
  ensureSupervisorScript()

  const servicePath = join(SYSTEMD_USER_DIR, `opencode-job-${scopeId}-${job.slug}.service`)
  const timerPath = join(SYSTEMD_USER_DIR, `opencode-job-${scopeId}-${job.slug}.timer`)

  // Also stop/disable legacy units (pre-scope)
  try {
    execSync(`systemctl --user stop opencode-job-${job.slug}.timer`, { stdio: "ignore" })
    execSync(`systemctl --user disable opencode-job-${job.slug}.timer`, { stdio: "ignore" })
  } catch {}

  // Write service and timer
  writeFileSync(servicePath, createSystemdService(job))
  writeFileSync(timerPath, createSystemdTimer(job))

  // Reload and enable
  execSync("systemctl --user daemon-reload")
  execSync(`systemctl --user enable opencode-job-${scopeId}-${job.slug}.timer`)
  execSync(`systemctl --user start opencode-job-${scopeId}-${job.slug}.timer`)
}

function uninstallSystemdJob(job: Job): void {
  const scopeId = job.scopeId || deriveScopeId(job.workdir || homedir())

  const scopedTimerUnit = `opencode-job-${scopeId}-${job.slug}.timer`
  const legacyTimerUnit = `opencode-job-${job.slug}.timer`

  for (const timerUnit of [scopedTimerUnit, legacyTimerUnit]) {
    try {
      execSync(`systemctl --user stop ${timerUnit}`, { stdio: "ignore" })
      execSync(`systemctl --user disable ${timerUnit}`, { stdio: "ignore" })
    } catch {}
  }

  const scopedServicePath = join(SYSTEMD_USER_DIR, `opencode-job-${scopeId}-${job.slug}.service`)
  const scopedTimerPath = join(SYSTEMD_USER_DIR, `opencode-job-${scopeId}-${job.slug}.timer`)
  const legacyServicePath = join(SYSTEMD_USER_DIR, `opencode-job-${job.slug}.service`)
  const legacyTimerPath = join(SYSTEMD_USER_DIR, `opencode-job-${job.slug}.timer`)

  for (const p of [scopedServicePath, scopedTimerPath, legacyServicePath, legacyTimerPath]) {
    if (existsSync(p)) {
      try {
        unlinkSync(p)
      } catch {}
    }
  }

  try {
    execSync("systemctl --user daemon-reload", { stdio: "ignore" })
  } catch {}
}

// === WINDOWS TASK SCHEDULER ===

function installWindowsJob(job: Job): void {
  // Remove stale task variants before (re)creating current definitions.
  uninstallWindowsJob(job)

  const taskDefinitions = cronToWindowsTaskDefinitions(job)
  for (const task of taskDefinitions) {
    execFileSync("schtasks", task.args, { stdio: "ignore" })
  }
}

function uninstallWindowsJob(job: Job): void {
  const candidates = new Set<string>()
  const scopedBase = windowsTaskBaseName(job)
  const legacyBase = `${WINDOWS_TASK_PREFIX}-${job.slug}`

  for (let i = 0; i < 64; i += 1) {
    const suffix = i === 0 ? "" : `-${i + 1}`
    candidates.add(`${WINDOWS_TASK_ROOT}\\${scopedBase}${suffix}`)
    candidates.add(`${WINDOWS_TASK_ROOT}\\${legacyBase}${suffix}`)
  }

  for (const taskName of candidates) {
    try {
      execFileSync("schtasks", ["/Delete", "/TN", taskName, "/F"], { stdio: "ignore" })
    } catch {}
  }
}

// === CROSS-PLATFORM ===

type SchedulerBackend = "launchd" | "systemd" | "schtasks" | "cron"

function isCommandAvailable(command: string): boolean {
  try {
    execSync(`command -v ${command}`, {
      stdio: "ignore",
      env: buildRunEnvironment(),
    })
    return true
  } catch {
    return false
  }
}

function isSystemdUserAvailable(): boolean {
  if (!IS_LINUX) return false
  if (!isCommandAvailable("systemctl")) return false
  try {
    execSync("systemctl --user show-environment", {
      stdio: "ignore",
      env: buildRunEnvironment(),
    })
    return true
  } catch {
    return false
  }
}

function isCronAvailable(): boolean {
  if (IS_WINDOWS) return false
  return isCommandAvailable("crontab")
}

function cronBlockId(job: Job): string {
  const scopeId = job.scopeId || deriveScopeId(job.workdir || homedir())
  return `${scopeId}:${job.slug}`
}

function cronLegacyBlockId(job: Job): string {
  return `legacy:${job.slug}`
}

function cronBlockStart(id: string): string {
  return `# BEGIN ${CRON_MANAGED_PREFIX} ${id}`
}

function cronBlockEnd(id: string): string {
  return `# END ${CRON_MANAGED_PREFIX} ${id}`
}

function shellEscapeDoubleQuoted(value: string): string {
  return value.replace(/(["\\$`])/g, "\\$1")
}

function readUserCrontab(): string {
  try {
    return execFileSync("crontab", ["-l"], { encoding: "utf-8" }) as string
  } catch (error) {
    const status = typeof error === "object" && error !== null ? (error as { status?: number }).status : undefined
    const stderrValue =
      typeof error === "object" && error !== null && "stderr" in error
        ? (error as { stderr?: string | Buffer }).stderr
        : undefined
    const stderr = Buffer.isBuffer(stderrValue) ? stderrValue.toString("utf-8") : (stderrValue ?? "")
    const noCrontab = status === 1 && (!stderr.trim() || /no crontab/i.test(stderr))
    if (noCrontab) return ""
    throw error
  }
}

function writeUserCrontab(content: string): void {
  const normalized = content.trim()
  const input = normalized ? `${normalized}\n` : ""
  execFileSync("crontab", ["-"], { input })
}

function stripManagedCronBlocks(content: string, blockIds: Set<string>): { content: string; removed: number } {
  const lines = content ? content.split(/\r?\n/) : []
  const retained: string[] = []
  const prefix = `# BEGIN ${CRON_MANAGED_PREFIX} `
  const endPrefix = `# END ${CRON_MANAGED_PREFIX} `
  let removed = 0

  for (let index = 0; index < lines.length; ) {
    const line = lines[index]
    if (!line.startsWith(prefix)) {
      retained.push(line)
      index += 1
      continue
    }

    const id = line.slice(prefix.length).trim()
    let endIndex = lines.length - 1
    for (let probe = index + 1; probe < lines.length; probe += 1) {
      if (lines[probe] === `${endPrefix}${id}`) {
        endIndex = probe
        break
      }
    }

    if (blockIds.has(id)) {
      removed += 1
    } else {
      for (let keep = index; keep <= endIndex; keep += 1) {
        retained.push(lines[keep])
      }
    }

    index = endIndex + 1
  }

  return {
    content: retained.join("\n").replace(/\n{3,}/g, "\n\n").trimEnd(),
    removed,
  }
}

function createCronEntry(job: Job): string {
  const scopeId = job.scopeId || deriveScopeId(job.workdir || homedir())
  const jobPath = jobFilePath(scopeId, job.slug)
  const logFilePath = scopedLogPath(scopeId, job.slug)
  const escapedSupervisor = shellEscapeDoubleQuoted(SUPERVISOR_PATH)
  const escapedJobPath = shellEscapeDoubleQuoted(jobPath)
  const escapedLogPath = shellEscapeDoubleQuoted(logFilePath)
  const envPreamble = renderCronEnvPreamble(job, getEnhancedPath())

  return `${job.schedule} ${envPreamble} /usr/bin/perl "${escapedSupervisor}" "${escapedJobPath}" >> "${escapedLogPath}" 2>&1`
}

function installCronJob(job: Job): void {
  if (!isCronAvailable()) {
    throw new Error("cron backend is unavailable: `crontab` command not found.")
  }

  ensureDir(LOGS_DIR)
  const scopeId = job.scopeId || deriveScopeId(job.workdir || homedir())
  ensureDir(scopeLogsDir(scopeId))
  ensureSupervisorScript()

  const blockId = cronBlockId(job)
  const current = readUserCrontab()
  const stripped = stripManagedCronBlocks(current, new Set([blockId, cronLegacyBlockId(job)]))
  const block = [cronBlockStart(blockId), createCronEntry(job), cronBlockEnd(blockId)].join("\n")
  const next = [stripped.content.trim(), block].filter(Boolean).join("\n\n")
  writeUserCrontab(next)
}

function uninstallCronJob(job: Job): void {
  if (!isCronAvailable()) return

  const current = readUserCrontab()
  const stripped = stripManagedCronBlocks(current, new Set([cronBlockId(job), cronLegacyBlockId(job)]))
  if (stripped.removed === 0) return
  writeUserCrontab(stripped.content)
}

function resolveSchedulerBackend(): SchedulerBackend {
  if (IS_MAC) return "launchd"
  if (IS_WINDOWS) return "schtasks"
  if (isSystemdUserAvailable()) return "systemd"
  if (isCronAvailable()) return "cron"

  if (IS_LINUX) {
    throw new Error(
      "No supported scheduler backend found: systemd --user is unavailable and `crontab` is not installed."
    )
  }

  throw new Error(
    `Unsupported platform: ${platform()}. Supported platforms: macOS (launchd), Linux (systemd or cron), Windows, and POSIX systems with cron.`
  )
}

function installJob(job: Job): SchedulerBackend {
  const backend = resolveSchedulerBackend()
  if (backend === "launchd") {
    installLaunchdJob(job)
  } else if (backend === "systemd") {
    try {
      installSystemdJob(job)
    } catch (error) {
      if (!isCronAvailable()) {
        throw error
      }
      installCronJob(job)
      return "cron"
    }
  } else if (backend === "schtasks") {
    installWindowsJob(job)
  } else {
    installCronJob(job)
  }
  return backend
}

function uninstallJob(job: Job): void {
  if (IS_MAC) {
    uninstallLaunchdJob(job)
    return
  }

  if (IS_WINDOWS) {
    uninstallWindowsJob(job)
    return
  }

  if (IS_LINUX) {
    uninstallSystemdJob(job)
    uninstallCronJob(job)
    return
  }

  uninstallCronJob(job)
}

// === JOB STORAGE ===

function ensureScopeStorage(scopeId: string): void {
  // jobs/ directory holds files containing env snapshots with secrets;
  // tighten to 0700. Other dirs (runs/locks/logs) are also tightened —
  // run JSONL records contain sessionIds which are sensitive enough to
  // not want world-readable on a multi-user host.
  ensureDir(SCHEDULER_DIR)
  ensureDir(SCOPES_DIR)
  ensureDirUserOnly(scopeJobsDir(scopeId))
  ensureDirUserOnly(scopeLocksDir(scopeId))
  ensureDirUserOnly(scopeRunsDir(scopeId))
  ensureDir(scopeLogsDir(scopeId))
}

function loadScopedJob(scopeId: string, slug: string): Job | null {
  ensureScopeStorage(scopeId)
  const path = jobFilePath(scopeId, slug)
  if (!existsSync(path)) return null
  try {
    return normalizeJob(JSON.parse(readFileSync(path, "utf-8")))
  } catch {
    return null
  }
}

function loadAllScopedJobs(scopeId: string): Job[] {
  ensureScopeStorage(scopeId)
  const files = readdirSync(scopeJobsDir(scopeId)).filter((f) => f.endsWith(".json"))
  return files
    .map((f) => {
      try {
        return normalizeJob(JSON.parse(readFileSync(join(scopeJobsDir(scopeId), f), "utf-8")))
      } catch {
        return null
      }
    })
    .filter(Boolean) as Job[]
}

function listScopeIds(): string[] {
  ensureDir(SCOPES_DIR)
  try {
    return readdirSync(SCOPES_DIR)
      .filter((name) => {
        try {
          return existsSync(scopeDir(name))
        } catch {
          return false
        }
      })
      .sort()
  } catch {
    return []
  }
}

function loadAllJobsAcrossScopes(): Job[] {
  const scopeIds = listScopeIds()
  const out: Job[] = []
  for (const scopeId of scopeIds) {
    out.push(...loadAllScopedJobs(scopeId))
  }
  return out
}

function loadLegacyJob(slug: string): Job | null {
  ensureDir(LEGACY_JOBS_DIR)
  const path = join(LEGACY_JOBS_DIR, `${slug}.json`)
  if (!existsSync(path)) return null
  try {
    return normalizeJob(JSON.parse(readFileSync(path, "utf-8")))
  } catch {
    return null
  }
}

function loadAllLegacyJobs(): Job[] {
  ensureDir(LEGACY_JOBS_DIR)
  const files = readdirSync(LEGACY_JOBS_DIR).filter((f) => f.endsWith(".json"))
  return files
    .map((f) => {
      try {
        return normalizeJob(JSON.parse(readFileSync(join(LEGACY_JOBS_DIR, f), "utf-8")))
      } catch {
        return null
      }
    })
    .filter(Boolean) as Job[]
}

function saveJob(job: Job): void {
  const scopeId = job.scopeId || deriveScopeId(job.workdir || homedir())
  const normalizedJob: Job = { ...job, scopeId }
  ensureScopeStorage(scopeId)
  const path = jobFilePath(scopeId, normalizedJob.slug)
  // Job files contain env.snapshot with secrets — must be 0600.
  writeFileUserOnly(path, JSON.stringify(sanitizeJob(normalizedJob), null, 2))
}

function deleteJobFile(job: Job): void {
  const scopeId = job.scopeId || deriveScopeId(job.workdir || homedir())
  const path = jobFilePath(scopeId, job.slug)
  if (existsSync(path)) {
    unlinkSync(path)
  }
}

interface GlobalCleanupPlan {
  scopeIds: string[]
  jobsToUninstall: Job[]
  scopedJobDefinitionPaths: string[]
  legacyJobDefinitionPaths: string[]
  lockPaths: string[]
  runHistoryPaths: string[]
  logPaths: string[]
  launchdPaths: string[]
  systemdPaths: string[]
}

interface GlobalCleanupExecution {
  dryRun: boolean
  includeHistory: boolean
  removed: {
    scopedJobDefinitions: string[]
    legacyJobDefinitions: string[]
    locks: string[]
    runHistory: string[]
    logs: string[]
    launchdUnits: string[]
    systemdUnits: string[]
  }
  errors: string[]
}

function listDirectoryFiles(
  dir: string,
  options?: { prefix?: string; suffix?: string }
): string[] {
  if (!existsSync(dir)) return []
  try {
    const entries = readdirSync(dir, { withFileTypes: true })
    return entries
      .filter((entry) => entry.isFile())
      .map((entry) => entry.name)
      .filter((name) => (options?.prefix ? name.startsWith(options.prefix) : true))
      .filter((name) => (options?.suffix ? name.endsWith(options.suffix) : true))
      .map((name) => join(dir, name))
      .sort()
  } catch {
    return []
  }
}

function listDirectoryNames(dir: string): string[] {
  if (!existsSync(dir)) return []
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort()
  } catch {
    return []
  }
}

function uniquePaths(paths: string[]): string[] {
  return Array.from(new Set(paths)).sort()
}

function buildGlobalCleanupPlan(includeHistory: boolean): GlobalCleanupPlan {
  const scopeIds = listScopeIds()
  const scopedJobDefinitionPaths = scopeIds.flatMap((scopeId) => listDirectoryFiles(scopeJobsDir(scopeId), { suffix: ".json" }))
  const lockPaths = scopeIds.flatMap((scopeId) => listDirectoryFiles(scopeLocksDir(scopeId), { suffix: ".json" }))
  const runHistoryPaths = includeHistory
    ? scopeIds.flatMap((scopeId) => listDirectoryFiles(scopeRunsDir(scopeId), { suffix: ".jsonl" }))
    : []

  const schedulerLogsRoot = join(LOGS_DIR, "scheduler")
  const logScopeIds = listDirectoryNames(schedulerLogsRoot)
  const logPaths = includeHistory
    ? logScopeIds.flatMap((scopeId) => listDirectoryFiles(join(schedulerLogsRoot, scopeId), { suffix: ".log" }))
    : []

  const launchdPaths = IS_MAC
    ? listDirectoryFiles(LAUNCH_AGENTS_DIR, { prefix: `${LAUNCHD_PREFIX}.`, suffix: ".plist" })
    : []
  const systemdPaths = IS_LINUX
    ? [
        ...listDirectoryFiles(SYSTEMD_USER_DIR, { prefix: "opencode-job-", suffix: ".service" }),
        ...listDirectoryFiles(SYSTEMD_USER_DIR, { prefix: "opencode-job-", suffix: ".timer" }),
      ]
    : []

  const jobsToUninstall = [...loadAllJobsAcrossScopes(), ...loadAllLegacyJobs()]

  return {
    scopeIds,
    jobsToUninstall,
    scopedJobDefinitionPaths: uniquePaths(scopedJobDefinitionPaths),
    legacyJobDefinitionPaths: listDirectoryFiles(LEGACY_JOBS_DIR, { suffix: ".json" }),
    lockPaths: uniquePaths(lockPaths),
    runHistoryPaths: uniquePaths(runHistoryPaths),
    logPaths: uniquePaths(logPaths),
    launchdPaths: uniquePaths(launchdPaths),
    systemdPaths: uniquePaths(systemdPaths),
  }
}

function removePaths(paths: string[], errors: string[]): string[] {
  const removed: string[] = []
  for (const path of uniquePaths(paths)) {
    if (!existsSync(path)) continue
    try {
      rmSync(path, { recursive: true, force: true })
      removed.push(path)
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error)
      errors.push(`Failed to remove ${path}: ${msg}`)
    }
  }
  return removed
}

function executeGlobalCleanup(plan: GlobalCleanupPlan, options: { dryRun: boolean; includeHistory: boolean }): GlobalCleanupExecution {
  const errors: string[] = []
  const dryRun = options.dryRun

  if (!dryRun) {
    for (const job of plan.jobsToUninstall) {
      try {
        uninstallJob(job)
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error)
        errors.push(`Failed to uninstall scheduler entry for ${job.slug}: ${msg}`)
      }
    }
  }

  const removeOrPreview = (paths: string[]): string[] => {
    if (dryRun) return uniquePaths(paths).filter((path) => existsSync(path))
    return removePaths(paths, errors)
  }

  const removed = {
    scopedJobDefinitions: removeOrPreview(plan.scopedJobDefinitionPaths),
    legacyJobDefinitions: removeOrPreview(plan.legacyJobDefinitionPaths),
    locks: removeOrPreview(plan.lockPaths),
    runHistory: options.includeHistory ? removeOrPreview(plan.runHistoryPaths) : [],
    logs: options.includeHistory ? removeOrPreview(plan.logPaths) : [],
    launchdUnits: removeOrPreview(plan.launchdPaths),
    systemdUnits: removeOrPreview(plan.systemdPaths),
  }

  return {
    dryRun,
    includeHistory: options.includeHistory,
    removed,
    errors,
  }
}

function formatCleanupLine(label: string, count: number, location: string): string {
  return `- ${label}: ${count} (${location})`
}

function formatGlobalCleanupOutput(execution: GlobalCleanupExecution): string {
  const mode = execution.dryRun ? "DRY RUN (no files deleted)" : "EXECUTED"
  const lines = [
    `Global scheduler cleanup: ${mode}`,
    "",
    formatCleanupLine("Scoped job definitions", execution.removed.scopedJobDefinitions.length, `${SCOPES_DIR}/*/jobs`),
    formatCleanupLine("Legacy job definitions", execution.removed.legacyJobDefinitions.length, LEGACY_JOBS_DIR),
    formatCleanupLine("Lock files", execution.removed.locks.length, `${SCOPES_DIR}/*/locks`),
  ]

  if (execution.includeHistory) {
    lines.push(formatCleanupLine("Run history", execution.removed.runHistory.length, `${SCOPES_DIR}/*/runs`))
    lines.push(formatCleanupLine("Logs", execution.removed.logs.length, `${LOGS_DIR}/scheduler/*`))
  } else {
    lines.push("- Run history: skipped (set includeHistory=true)")
    lines.push("- Logs: skipped (set includeHistory=true)")
  }

  if (IS_MAC) {
    lines.push(formatCleanupLine("launchd plists", execution.removed.launchdUnits.length, LAUNCH_AGENTS_DIR))
  }

  if (IS_LINUX) {
    lines.push(formatCleanupLine("systemd units", execution.removed.systemdUnits.length, SYSTEMD_USER_DIR))
  }

  if (execution.errors.length > 0) {
    lines.push("")
    lines.push("Errors:")
    for (const error of execution.errors) {
      lines.push(`- ${error}`)
    }
  }

  if (execution.dryRun) {
    lines.push("")
    lines.push("Re-run with confirm=true to apply this cleanup.")
  }

  return lines.join("\n")
}

// === Session policy parsers / validators (S4 + S6) ===

const SESSION_POLICY_REQUIRED_MESSAGE =
  "sessionPolicy is required. Pick one: 'current' (continue this chat), 'existing' (write into a specific session — supply sessionId), 'new-per-job' (one fresh session reused forever), 'new-per-run' (a fresh session every fire). Ask the user which one fits their intent — do not guess."

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
export function parseSessionPolicy(raw: unknown): SessionPolicy {
  if (raw === undefined || raw === null) {
    throw new Error(SESSION_POLICY_REQUIRED_MESSAGE)
  }
  if (typeof raw !== "string") {
    throw new Error("sessionPolicy must be a string")
  }
  const trimmed = raw.trim()
  if (!trimmed) {
    throw new Error(SESSION_POLICY_REQUIRED_MESSAGE)
  }
  if (trimmed === "current" || trimmed === "existing" || trimmed === "new-per-job" || trimmed === "new-per-run") {
    return trimmed
  }
  throw new Error(`Invalid sessionPolicy: ${trimmed} (expected: current | existing | new-per-job | new-per-run)`)
}

/**
 * Resolve the effective `sessionPolicy` for an already-persisted job.
 * Defaults to `current` for back-compat with `job.json` files written
 * before F1 made the arg required on `schedule_job`. Read paths only;
 * NEVER reuse on the schedule_job arg path — see {@link parseSessionPolicy}.
 */
export function getEffectiveSessionPolicy(job: { sessionPolicy?: SessionPolicy }): SessionPolicy {
  return job.sessionPolicy ?? "current"
}

export function parseExecutionPolicy(raw: unknown): ExecutionPolicy {
  if (raw === undefined || raw === null) return "prefer-live-server"
  if (typeof raw !== "string") {
    throw new Error("executionPolicy must be a string")
  }
  const trimmed = raw.trim()
  if (!trimmed) return "prefer-live-server"
  if (trimmed === "prefer-live-server" || trimmed === "headless-only") return trimmed
  throw new Error(`Invalid executionPolicy: ${trimmed} (expected: prefer-live-server | headless-only)`)
}

export function parseDeliveryPolicy(raw: unknown): DeliveryPolicy {
  if (raw === undefined || raw === null) return "execute"
  if (typeof raw !== "string") {
    throw new Error("deliveryPolicy must be a string")
  }
  const trimmed = raw.trim()
  if (!trimmed) return "execute"
  if (trimmed === "execute" || trimmed === "leave-message") return trimmed
  throw new Error(`Invalid deliveryPolicy: ${trimmed} (expected: execute | leave-message)`)
}

/**
 * Schedule-time validation matrix (S6). Returns an error message string
 * if validation fails, or undefined on success.
 *
 * The session.create call for new-per-job is performed by the caller
 * (it needs the resolved id) — this function only checks the
 * preconditions that are local to the args themselves.
 */
export function validateSessionPolicyArgs(input: {
  sessionPolicy: SessionPolicy
  executionPolicy: ExecutionPolicy
  deliveryPolicy: DeliveryPolicy
  sessionId?: string
  attachUrl?: string
  toolSessionID?: string
}): string | undefined {
  const sid = (input.sessionId ?? "").trim()

  if (input.sessionPolicy === "current") {
    const fallback = (input.toolSessionID ?? "").trim()
    if (!sid && !fallback) {
      return "sessionPolicy='current' requires a session context (run from inside an opencode session) or pass sessionId explicitly."
    }
  }

  if (input.sessionPolicy === "existing" && !sid) {
    return "sessionPolicy='existing' requires sessionId."
  }

  if (input.executionPolicy === "headless-only" && input.attachUrl) {
    return "executionPolicy='headless-only' is incompatible with attachUrl. Drop attachUrl or use executionPolicy='prefer-live-server'."
  }

  // leave-message + headless-only is a no-op (headless always executes).
  // We accept it but log a warning into the result; the caller renders.
  // (Not a hard error per plan.)

  return undefined
}

function normalizeAttachUrl(attachUrl?: string): string | undefined {
  if (attachUrl === undefined) return undefined
  const trimmed = attachUrl.trim()
  if (!trimmed) return undefined
  try {
    new URL(trimmed)
  } catch {
    throw new Error(`Invalid attach URL: ${attachUrl}`)
  }
  return trimmed
}

/**
 * Sentinel hostname used by the opencode TUI worker when no `--port`
 * was supplied (`opencode-fork/packages/opencode/src/cli/cmd/tui/worker.ts`).
 * Routes traffic over the in-process IPC bridge instead of TCP, so
 * any external process (supervisor, launchd job, fire-time runner)
 * cannot reach it.
 */
const INTERNAL_SERVER_HOSTNAME = "opencode.internal"

/**
 * `serverUrl` from the Plugin runtime is `http://opencode.internal/...`
 * when the host opencode was launched without `--port`. Used by F2a
 * to decide whether to warn the user that live in-TUI delivery is
 * impossible for the chosen sessionPolicy.
 */
export function isInternalServerUrl(serverUrl: URL | string): boolean {
  try {
    const url = typeof serverUrl === "string" ? new URL(serverUrl) : serverUrl
    return url.hostname === INTERNAL_SERVER_HOSTNAME
  } catch {
    return false
  }
}

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
export function resolveEffectiveAttachUrl(input: {
  argAttachUrl?: string
  serverUrl: URL | string
  sessionPolicy: SessionPolicy
  executionPolicy: ExecutionPolicy
}): { attachUrl?: string; autoFromServerUrl: boolean; internalWarning: boolean } {
  if (input.argAttachUrl && input.argAttachUrl.trim()) {
    return {
      attachUrl: normalizeAttachUrl(input.argAttachUrl),
      autoFromServerUrl: false,
      internalWarning: false,
    }
  }

  // User explicitly chose headless — never auto-attach.
  if (input.executionPolicy === "headless-only") {
    return { attachUrl: undefined, autoFromServerUrl: false, internalWarning: false }
  }

  const serverUrlString = typeof input.serverUrl === "string" ? input.serverUrl : input.serverUrl.toString()

  if (isInternalServerUrl(input.serverUrl)) {
    const routesToCallingTui = input.sessionPolicy === "current" || input.sessionPolicy === "existing"
    return {
      attachUrl: undefined,
      autoFromServerUrl: false,
      internalWarning: routesToCallingTui,
    }
  }

  // External serverUrl + no explicit arg → auto-promote.
  return {
    attachUrl: normalizeAttachUrl(serverUrlString),
    autoFromServerUrl: true,
    internalWarning: false,
  }
}

/**
 * Derive the registry entry for the calling opencode process from
 * the plugin's `serverUrl` input. Returns `undefined` for the
 * in-process IPC sentinel (`http://opencode.internal/...`) — those
 * entries would be useless to any external reader.
 *
 * Exported so plugin init can stay declarative and so the helper is
 * unit-testable without spinning up the full plugin runtime.
 */
export function buildOwnRegistryEntry(input: {
  serverUrl: URL | string
  pid?: number
  workdir?: string
  startedAt?: string
  agent?: "tui" | "headless"
}): RegistryEntry | undefined {
  if (isInternalServerUrl(input.serverUrl)) return undefined

  const url = typeof input.serverUrl === "string" ? new URL(input.serverUrl) : input.serverUrl
  const portStr = url.port || (url.protocol === "https:" ? "443" : "80")
  const port = Number.parseInt(portStr, 10)
  if (!Number.isFinite(port) || port < 0) return undefined

  return {
    schemaVersion: REGISTRY_SCHEMA_VERSION,
    pid: input.pid ?? process.pid,
    port,
    url: url.toString(),
    workdir: input.workdir ?? process.cwd(),
    startedAt: input.startedAt ?? new Date().toISOString(),
    agent: input.agent,
  }
}

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
export function initRegistryForPlugin(input: {
  serverUrl: URL | string
  workdir?: string
  agent?: "tui" | "headless"
  registryDir?: string
}): { entry?: RegistryEntry; sweepRemoved: number } {
  let sweepRemoved = 0
  try {
    sweepRemoved = sweepStaleEntries(input.registryDir).removed
  } catch {
    // never block startup on a sweep failure
  }

  const entry = buildOwnRegistryEntry({
    serverUrl: input.serverUrl,
    workdir: input.workdir,
    agent: input.agent,
  })
  if (!entry) return { sweepRemoved }

  try {
    writeRegistryEntry(entry, input.registryDir ?? undefined)
  } catch {
    // unwriteable runtime dir — the next install / sweep will retry;
    // discovery just won't see us this run
    return { sweepRemoved }
  }

  // Register exit handlers exactly once per process.
  if (!REGISTRY_EXIT_HANDLERS_INSTALLED.has(entry.pid)) {
    REGISTRY_EXIT_HANDLERS_INSTALLED.add(entry.pid)
    const cleanup = (): void => {
      try {
        removeRegistryEntry(entry.pid, input.registryDir ?? undefined)
      } catch {
        // best-effort; sweep handles leftovers
      }
    }
    process.once("exit", cleanup)
    // SIGINT / SIGTERM handlers re-emit the signal so we don't change
    // process exit semantics (pending listeners still see it, default
    // exit code is preserved).
    const signalHandler = (signal: NodeJS.Signals) => {
      cleanup()
      process.kill(process.pid, signal)
    }
    process.once("SIGINT", signalHandler)
    process.once("SIGTERM", signalHandler)
  }

  return { entry, sweepRemoved }
}

/**
 * Tracks pids that already had exit handlers installed in this
 * process. Defends against pathological cases where the plugin gets
 * initialized twice (multiple Plugin entries pointing at the same
 * bundle — unlikely but cheap to guard against).
 */
const REGISTRY_EXIT_HANDLERS_INSTALLED = new Set<number>()

/**
 * Render the result of `executeInstallServerConfig` as a single
 * agent-readable text block. Each status maps to one short paragraph
 * with the diff (when relevant) and the next-step hint, so the agent
 * can copy/paste a useful response back to the user without parsing
 * structured fields.
 */
export function formatInstallServerConfigResult(result: InstallServerConfigResult): string {
  if (result.ok && result.status === "preview") {
    return [
      `Preview only — nothing written.`,
      `Config: ${result.configPath}`,
      `Plan: ${result.plan.diff}`,
      ``,
      `Call install_server_config again with confirm: true to apply this change.`,
      result.plan.action.kind === "overwrite-port"
        ? `Also pass overwrite: true (current server.port = ${result.plan.action.previous}).`
        : ``,
    ]
      .filter(Boolean)
      .join("\n")
  }

  if (result.ok && result.status === "noop") {
    return [
      `No change needed.`,
      `Config: ${result.configPath}`,
      result.plan.diff,
    ].join("\n")
  }

  if (result.ok && result.status === "written") {
    return [
      `Wrote ${result.configPath}.`,
      `Change: ${result.plan.diff}`,
      ``,
      `Restart opencode for server.port to take effect (read at startup, not live-reloaded).`,
    ].join("\n")
  }

  if (!result.ok && result.status === "needs-overwrite") {
    const action = result.plan.action.kind === "overwrite-port" ? result.plan.action : null
    const previous = action ? action.previous : "(unknown)"
    const next = action ? action.next : "(unknown)"
    return [
      `Refusing to overwrite an existing different value.`,
      `Config: ${result.configPath}`,
      `Current server.port = ${previous}; requested = ${next}.`,
      ``,
      `Pass overwrite: true (and confirm: true) to replace it.`,
    ].join("\n")
  }

  if (!result.ok && result.status === "invalid-port") {
    return `Invalid port: ${result.reason}`
  }

  if (!result.ok && result.status === "read-error") {
    return `Failed to read config at ${result.configPath}: ${result.reason}`
  }

  if (!result.ok && result.status === "plan-error") {
    return `Cannot plan config update for ${result.configPath}: ${result.reason}`
  }

  // write-error
  return `Failed to write config at ${"configPath" in result ? result.configPath : "(unknown)"}: ${"reason" in result ? result.reason : "(unknown)"}`
}

/**
 * Build the F2a warning block appended to `schedule_job` success output
 * when the host opencode is in-process-only and live delivery into the
 * calling TUI is impossible.
 */
export function buildInternalServerWarning(): string {
  return [
    "WARNING: this opencode is running without an external HTTP port (serverUrl is http://opencode.internal/...).",
    "Scheduled runs will deliver via headless opencode: messages land in storage immediately, but the open TUI",
    "will NOT refresh until you re-open the session. To get live in-TUI delivery, restart opencode with",
    "`--port 0` (OS-assigned random port) or `--port N`, then re-create the job — the plugin will auto-detect",
    "the new serverUrl and attach to it. Once the upstream Zod fix lands you can also set `server.port: 0` in",
    "`~/.config/opencode/opencode.json` and skip the CLI flag.",
  ].join(" ")
}

/**
 * Structural status returned by `ensureBestPracticesSkill`. Pulled out
 * as a named type so {@link formatScheduleJobSuccess} can be tested
 * without spinning up the real skill installer.
 */
export interface SkillEnsureStatus {
  status: "present" | "installed" | "failed"
  path: string
  reason?: string
}

/**
 * Render the `schedule_job` success text. Pulled out of the tool body
 * so the F2a warning placement (and F2b auto-attach line) can be unit
 * tested without spinning up the full plugin runtime / fs / OS scheduler
 * stack. The tool body wires the inputs; this function owns the layout.
 */
export function formatScheduleJobSuccess(input: {
  name: string
  schedule: string
  scheduleHuman: string
  platformName: string
  workdir: string
  attachUrl?: string
  attachUrlAutoFromServerUrl: boolean
  primaryLine: string
  skillEnsure: SkillEnsureStatus
  internalWarning: boolean
  reliabilityLine: string
}): string {
  const attachLine = input.attachUrl
    ? input.attachUrlAutoFromServerUrl
      ? `Attach URL: ${input.attachUrl} (auto-detected from this opencode's serverUrl; pass attachUrl explicitly to override)\n`
      : `Attach URL: ${input.attachUrl}\n`
    : ""

  const internalWarningBlock = input.internalWarning ? `\n${buildInternalServerWarning()}\n` : ""

  const skillLine =
    input.skillEnsure.status === "installed"
      ? `\nInstalled scheduled-job-best-practices skill at ${input.skillEnsure.path}`
      : input.skillEnsure.status === "failed"
        ? `\nNote: could not install scheduled-job-best-practices skill (${input.skillEnsure.reason}); add it manually with install_skill`
        : ""

  return `Scheduled "${input.name}"

Schedule: ${input.schedule} (${input.scheduleHuman})
Platform: ${input.platformName}
Working Directory: ${input.workdir}
${attachLine}${input.primaryLine}${skillLine}
${internalWarningBlock}
${input.reliabilityLine}

Commands:
- "run ${input.name} now" - run immediately
- "show my jobs" - list all
- "delete job ${input.name}" - remove`
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function normalizeRunFormat(value: unknown): OpencodeRunFormat | undefined {
  if (typeof value !== "string") return undefined
  const trimmed = value.trim()
  if (trimmed === "json") return "json"
  if (trimmed === "default") return "default"
  return undefined
}

function parseRunFormatInput(value: unknown): OpencodeRunFormat | undefined {
  if (value === undefined) return undefined
  if (typeof value === "string" && !value.trim()) return undefined
  const normalized = normalizeRunFormat(value)
  if (normalized) return normalized
  throw new Error(`Invalid runFormat: ${String(value)} (expected: default | json)`)
}

function normalizeRunSpec(run: JobRunSpec): JobRunSpec {
  const normalized: JobRunSpec = { ...run }

  if (typeof normalized.prompt === "string") {
    const trimmed = normalized.prompt.trim()
    normalized.prompt = trimmed ? trimmed : undefined
  }

  if (typeof normalized.command === "string") {
    const trimmed = normalized.command.trim()
    normalized.command = trimmed ? trimmed : undefined
  }

  if (typeof normalized.arguments === "string") {
    const trimmed = normalized.arguments.trim()
    normalized.arguments = trimmed ? trimmed : undefined
  }

  if (Array.isArray(normalized.files)) {
    const files = normalized.files.map((file) => String(file).trim()).filter(Boolean)
    normalized.files = files.length ? files : undefined
  }

  if (typeof normalized.agent === "string") {
    const trimmed = normalized.agent.trim()
    normalized.agent = trimmed ? trimmed : undefined
  }

  if (typeof normalized.model === "string") {
    const trimmed = normalized.model.trim()
    normalized.model = trimmed ? trimmed : undefined
  }

  if (typeof normalized.variant === "string") {
    const trimmed = normalized.variant.trim()
    normalized.variant = trimmed ? trimmed : undefined
  }

  if (typeof normalized.title === "string") {
    const trimmed = normalized.title.trim()
    normalized.title = trimmed ? trimmed : undefined
  }

  if (normalized.share !== true) {
    normalized.share = undefined
  }

  if (normalized.continue !== true) {
    normalized.continue = undefined
  }

  if (typeof normalized.session === "string") {
    const trimmed = normalized.session.trim()
    normalized.session = trimmed ? trimmed : undefined
  }

  if (normalized.runFormat !== "json") {
    normalized.runFormat = normalized.runFormat === "default" ? "default" : undefined
  }

  if (typeof normalized.attachUrl === "string") {
    const trimmed = normalized.attachUrl.trim()
    normalized.attachUrl = trimmed ? trimmed : undefined
  }

  if (typeof normalized.port === "number" && Number.isFinite(normalized.port)) {
    normalized.port = Math.floor(normalized.port)
    if (normalized.port <= 0) normalized.port = undefined
  } else {
    normalized.port = undefined
  }

  return normalized
}

function validateRunSpec(run: JobRunSpec): void {
  const hasPrompt = typeof run.prompt === "string" && run.prompt.trim().length > 0
  const hasCommand = typeof run.command === "string" && run.command.trim().length > 0

  if (!hasPrompt && !hasCommand) {
    throw new Error("Job must have either run.prompt or run.command")
  }

  if (hasPrompt && hasCommand) {
    throw new Error("Job cannot specify both run.prompt and run.command")
  }

  if (hasCommand && run.arguments !== undefined && typeof run.arguments !== "string") {
    throw new Error("run.arguments must be a string")
  }

  if (run.attachUrl !== undefined) {
    normalizeAttachUrl(run.attachUrl)
  }

  if (run.port !== undefined) {
    if (!Number.isFinite(run.port) || run.port <= 0) {
      throw new Error("run.port must be a positive integer")
    }
  }

  if (run.runFormat !== undefined && run.runFormat !== "default" && run.runFormat !== "json") {
    throw new Error("run.runFormat must be 'default' or 'json'")
  }
}

function getJobRun(job: Job): JobRunSpec {
  if (job.run) {
    return job.run
  }

  const fallbackPrompt = (job.prompt ?? "").trim()
  if (!fallbackPrompt) {
    throw new Error(`Job "${job.slug}" is missing a prompt. Update the job to include run.prompt or prompt.`)
  }

  return {
    prompt: fallbackPrompt,
    attachUrl: job.attachUrl,
  }
}

function sanitizeJob(job: Job): Job {
  const sanitized: Job = { ...job }

  if (typeof sanitized.workdir === "string") {
    const trimmed = sanitized.workdir.trim()
    sanitized.workdir = trimmed ? trimmed : undefined
  }

  if (typeof sanitized.scopeId === "string") {
    const trimmed = sanitized.scopeId.trim()
    sanitized.scopeId = trimmed ? trimmed : undefined
  }

  if (!sanitized.scopeId) {
    sanitized.scopeId = deriveScopeId(sanitized.workdir || homedir())
  }

  if (sanitized.timeoutSeconds !== undefined) {
    const n = sanitized.timeoutSeconds
    if (typeof n !== "number" || !Number.isFinite(n) || n < 0 || Math.floor(n) !== n) {
      throw new Error("timeoutSeconds must be a non-negative integer")
    }
  }

  if (sanitized.invocation !== undefined) {
    const inv = sanitized.invocation as unknown
    if (!inv || typeof inv !== "object") {
      throw new Error("invocation must be an object")
    }
    const rec = inv as Record<string, unknown>
    if (typeof rec.command !== "string" || !rec.command.trim()) {
      throw new Error("invocation.command must be a non-empty string")
    }
    if (!Array.isArray(rec.args)) {
      throw new Error("invocation.args must be an array")
    }
    sanitized.invocation = {
      command: rec.command,
      args: rec.args.map((v) => String(v)),
    }
  }

  if (sanitized.run) {
    const normalized = normalizeRunSpec(sanitized.run)
    validateRunSpec(normalized)
    sanitized.run = normalized
  }

  if (sanitized.attachUrl !== undefined) {
    sanitized.attachUrl = normalizeAttachUrl(sanitized.attachUrl)
  }

  if (sanitized.prompt !== undefined) {
    const trimmed = sanitized.prompt.trim()
    sanitized.prompt = trimmed ? trimmed : undefined
  }

  return sanitized
}

function normalizeJobInvocation(raw: unknown): JobInvocation | undefined {
  if (!isRecord(raw)) return undefined
  if (typeof raw.command !== "string") return undefined
  if (!Array.isArray(raw.args)) return undefined
  const command = raw.command.trim()
  if (!command) return undefined
  return { command, args: raw.args.map((v) => String(v)) }
}

function normalizeJobRun(raw: unknown): JobRunSpec | undefined {
  if (!isRecord(raw)) return undefined

  const run: JobRunSpec = {}

  if (typeof raw.prompt === "string") run.prompt = raw.prompt
  if (typeof raw.command === "string") run.command = raw.command
  if (typeof raw.arguments === "string") run.arguments = raw.arguments

  if (Array.isArray(raw.files)) {
    run.files = raw.files.map((file) => String(file))
  }

  if (typeof raw.agent === "string") run.agent = raw.agent
  if (typeof raw.model === "string") run.model = raw.model
  if (typeof raw.variant === "string") run.variant = raw.variant
  if (typeof raw.title === "string") run.title = raw.title

  if (typeof raw.share === "boolean") run.share = raw.share
  if (typeof raw.continue === "boolean") run.continue = raw.continue
  if (typeof raw.session === "string") run.session = raw.session

  const runFormat = normalizeRunFormat(raw.runFormat)
  if (runFormat) run.runFormat = runFormat

  if (typeof raw.attachUrl === "string") run.attachUrl = raw.attachUrl

  if (typeof raw.port === "number" && Number.isFinite(raw.port)) {
    run.port = raw.port
  }

  return run
}

function normalizeJob(raw: unknown): Job | null {
  if (!isRecord(raw)) return null

  if (typeof raw.slug !== "string" || typeof raw.name !== "string" || typeof raw.schedule !== "string") {
    return null
  }

  const job: Job = {
    scopeId: typeof raw.scopeId === "string" ? raw.scopeId : undefined,
    slug: raw.slug,
    name: raw.name,
    schedule: raw.schedule,
    source: typeof raw.source === "string" ? raw.source : undefined,
    workdir: typeof raw.workdir === "string" ? raw.workdir : undefined,
    timeoutSeconds: typeof raw.timeoutSeconds === "number" ? raw.timeoutSeconds : undefined,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString(),
    updatedAt: typeof raw.updatedAt === "string" ? raw.updatedAt : undefined,
    lastRunAt: typeof raw.lastRunAt === "string" ? raw.lastRunAt : undefined,
    lastRunExitCode: typeof raw.lastRunExitCode === "number" ? raw.lastRunExitCode : undefined,
    lastRunError: typeof raw.lastRunError === "string" ? raw.lastRunError : undefined,
    lastRunSource:
      raw.lastRunSource === "manual" || raw.lastRunSource === "scheduled" ? raw.lastRunSource : undefined,
    lastRunStatus:
      raw.lastRunStatus === "running" || raw.lastRunStatus === "success" || raw.lastRunStatus === "failed"
        ? raw.lastRunStatus
        : undefined,
  }

  if (typeof raw.prompt === "string") job.prompt = raw.prompt
  if (typeof raw.attachUrl === "string") job.attachUrl = raw.attachUrl

  const run = normalizeJobRun(raw.run)
  if (run) job.run = run

  const inv = normalizeJobInvocation(raw.invocation)
  if (inv) job.invocation = inv

  const env = normalizeJobEnv(raw.env)
  if (env) job.env = env

  if (raw.sessionPolicy === "current" || raw.sessionPolicy === "existing" || raw.sessionPolicy === "new-per-job" || raw.sessionPolicy === "new-per-run") {
    job.sessionPolicy = raw.sessionPolicy
  }
  if (raw.executionPolicy === "prefer-live-server" || raw.executionPolicy === "headless-only") {
    job.executionPolicy = raw.executionPolicy
  }
  if (raw.deliveryPolicy === "execute" || raw.deliveryPolicy === "leave-message") {
    job.deliveryPolicy = raw.deliveryPolicy
  }

  const headlessInv = normalizeJobInvocation(raw.headlessInvocation)
  if (headlessInv) job.headlessInvocation = headlessInv

  return sanitizeJob(job)
}

function normalizeJobEnv(raw: unknown): JobEnv | undefined {
  if (!isRecord(raw)) return undefined
  const mode = raw.mode
  if (mode !== "snapshot" && mode !== "minimal" && mode !== "login-shell") return undefined
  const result: JobEnv = { mode }
  if (isRecord(raw.snapshot)) {
    const snapshot: Record<string, string> = {}
    for (const [key, value] of Object.entries(raw.snapshot)) {
      if (typeof value === "string") snapshot[key] = value
    }
    if (Object.keys(snapshot).length > 0) result.snapshot = snapshot
  }
  return result
}

function findJobByName(
  name: string,
  options?: { scopeId?: string; allScopes?: boolean; includeLegacy?: boolean }
): Job | null {
  const scopeId = options?.scopeId ?? currentScopeId()
  const slug = slugify(name)

  let job = loadScopedJob(scopeId, slug) || loadScopedJob(scopeId, name)

  if (!job) {
    const allJobs = loadAllScopedJobs(scopeId)
    job =
      allJobs.find(
        (j) =>
          j.slug === name ||
          j.slug.endsWith(`-${slug}`) ||
          j.name.toLowerCase() === name.toLowerCase() ||
          j.name.toLowerCase().includes(name.toLowerCase())
      ) || null
  }

  if (!job && options?.allScopes) {
    const allJobs = loadAllJobsAcrossScopes()
    job =
      allJobs.find(
        (j) =>
          j.slug === name ||
          j.slug.endsWith(`-${slug}`) ||
          j.name.toLowerCase() === name.toLowerCase() ||
          j.name.toLowerCase().includes(name.toLowerCase())
      ) || null
  }

  if (!job && options?.includeLegacy) {
    job = loadLegacyJob(slug) || loadLegacyJob(name)
    if (!job) {
      const allJobs = loadAllLegacyJobs()
      job =
        allJobs.find(
          (j) =>
            j.slug === name ||
            j.slug.endsWith(`-${slug}`) ||
            j.name.toLowerCase() === name.toLowerCase() ||
            j.name.toLowerCase().includes(name.toLowerCase())
        ) || null
    }
  }

  return job
}

function updateJobRecord(job: Job, updates: Partial<Job>): Job {
  const scopeId = job.scopeId || deriveScopeId(job.workdir || homedir())
  const latest = loadScopedJob(scopeId, job.slug) || job
  const updated: Job = {
    ...latest,
    ...updates,
    scopeId,
    updatedAt: new Date().toISOString(),
  }
  saveJob(updated)
  return updated
}

function getLogPath(job: Job): string {
  const scopeId = job.scopeId || deriveScopeId(job.workdir || homedir())
  return scopedLogPath(scopeId, job.slug)
}

function buildOpencodeArgs(job: Job, options?: { withAttachUrl?: boolean }): { command: string; args: string[] } {
  const inner = buildOpencodeArgsInner(job, options)

  // env.mode='login-shell' wraps the invocation in `$SHELL -lic '...'` so the
  // user's interactive shell rc files run before opencode does. Useful when
  // PATH/env capture (S2) is insufficient (e.g. lazily-loaded NVM that runs
  // only via .zshrc / .bashrc). Skipped on Windows: schtasks does not have an
  // equivalent, so we silently fall back to the direct invocation.
  //
  // Fallback to /bin/bash when $SHELL isn't set: bash is universally
  // available on macOS (even when default is zsh) and Linux. zsh is not
  // guaranteed on minimal Linux server images.
  if (job.env?.mode === "login-shell" && !IS_WINDOWS) {
    const shell = (process.env.SHELL ?? "").trim() || "/bin/bash"
    const flat = [inner.command, ...inner.args].map(shellEscapeSingleQuoted).join(" ")
    return { command: shell, args: ["-lic", flat] }
  }

  return inner
}

function shellEscapeSingleQuoted(value: string): string {
  // POSIX-safe single-quoted escape: end quote, escape '\'', re-open quote.
  return `'${value.replace(/'/g, `'\\''`)}'`
}

function buildOpencodeArgsInner(job: Job, options?: { withAttachUrl?: boolean }): { command: string; args: string[] } {
  const command = findOpencode()
  const run = normalizeRunSpec(getJobRun(job))
  validateRunSpec(run)

  const args = ["run"]

  // For headless invocation snapshots, omit `--attach` so the run
  // spawns its own session-bound process (no live HTTP).
  if (run.attachUrl && options?.withAttachUrl !== false) {
    args.push("--attach", run.attachUrl)
  }

  if (run.port !== undefined) {
    args.push("--port", String(run.port))
  }

  if (run.command) {
    args.push("--command", run.command)
  }

  if (run.agent) {
    args.push("--agent", run.agent)
  }

  if (run.model) {
    args.push("--model", run.model)
  }

  if (run.variant) {
    args.push("--variant", run.variant)
  }

  if (run.runFormat) {
    args.push("--format", run.runFormat)
  }

  if (run.share) {
    args.push("--share")
  }

  if (run.title) {
    args.push("--title", run.title)
  }

  if (run.continue) {
    args.push("--continue")
  }

  if (run.session) {
    args.push("--session", run.session)
  }

  for (const file of run.files ?? []) {
    args.push("--file", file)
  }

  args.push("--")
  args.push(run.command ? run.arguments ?? "" : run.prompt ?? "")

  return { command, args }
}

function buildRunEnvironment(): NodeJS.ProcessEnv {
  // Terminal PATH first, fallback list second. getEnhancedPath() already
  // dedups, so explicit concatenation with process.env.PATH is unnecessary.
  const combinedPath = getEnhancedPath({ withTerminalPath: true })

  // Keep scheduled jobs non-interactive by default.
  //
  // - `question: deny` ensures scheduled runs never block waiting for a prompt.
  // - We merge this with any existing OPENCODE_PERMISSION JSON if present.
  const basePolicy: Record<string, unknown> = { question: "deny" }

  const mergedPolicy = (() => {
    const raw = process.env.OPENCODE_PERMISSION
    if (!raw) return basePolicy
    try {
      const existing = JSON.parse(raw) as unknown
      if (isRecord(existing)) {
        return { ...existing, ...basePolicy }
      }
    } catch {}
    return basePolicy
  })()

  // Pass through full process.env (terminal parity for in-process runs).
  // Scheduled runs handled by supervisor.pl get their env from job.env.snapshot
  // — this function is only used for manual `run_job` and helper subprocess
  // calls (isCommandAvailable, getOpencodeVersion, getJobLogs).
  const config = loadSchedulerConfig()
  return {
    ...process.env,
    ...config.env?.set,
    PATH: combinedPath,
    OPENCODE_PERMISSION: JSON.stringify(mergedPolicy),
  }
}

function loadSchedulerConfig(): SchedulerConfig {
  if (!existsSync(SCHEDULER_CONFIG)) return {}
  try {
    const raw = readFileSync(SCHEDULER_CONFIG, "utf-8")
    const parsed = JSON.parse(raw) as unknown
    if (!isRecord(parsed)) return {}

    const env = isRecord(parsed.env) ? (parsed.env as Record<string, unknown>) : undefined
    if (env) {
      // Detect legacy keys and warn (one-shot) — they're accepted into the
      // type for back-compat but no longer have any effect.
      const legacy: string[] = []
      if ("preserve" in env) legacy.push("env.preserve")
      if ("preserveOpencodeEnv" in env) legacy.push("env.preserveOpencodeEnv")
      if (legacy.length > 0) warnLegacyEnvKeysOnce(legacy)

      // Reject unknown env.mode values rather than silently defaulting.
      // Throws so the user notices misconfig instead of getting wrong env.
      if ("mode" in env) {
        const mode = env.mode
        if (mode !== "snapshot" && mode !== "minimal" && mode !== "login-shell") {
          throw new Error(
            `Invalid env.mode in ${SCHEDULER_CONFIG}: ${String(mode)} (expected: snapshot | minimal | login-shell)`
          )
        }
      }

      // Reject env.set keys that collide with the scheduler-internal denylist —
      // they would never propagate anyway.
      if (isRecord(env.set)) {
        for (const key of Object.keys(env.set)) {
          if (ENV_DENYLIST_INTERNAL.has(key)) {
            throw new Error(
              `Invalid env.set in ${SCHEDULER_CONFIG}: '${key}' is reserved by the scheduler and cannot be set.`
            )
          }
        }
      }
    }

    return parsed as SchedulerConfig
  } catch (error) {
    // If validation threw, propagate so schedule_job surfaces the message.
    // For JSON parse errors etc., return empty config (best-effort).
    if (error instanceof Error && /Invalid env\./.test(error.message)) {
      throw error
    }
    return {}
  }
}

function getOpencodeVersion(opencodePath: string): string | null {
  try {
    const output = execSync(`"${opencodePath}" --version`, { env: buildRunEnvironment() })
      .toString()
      .trim()
    return output || null
  } catch {
    return null
  }
}

function runJobNow(job: Job): { startedAt: string; logPath: string; pid?: number; job: Job | null } {
  ensureDir(LOGS_DIR)
  ensureDir(scopeLogsDir(job.scopeId || deriveScopeId(job.workdir || homedir())))
  const startedAt = new Date().toISOString()
  const logPath = getLogPath(job)
  const logStream = createWriteStream(logPath, { flags: "a" })
  const workdir = job.workdir || homedir()

  logStream.write(`\n=== Manual run ${startedAt} ===\n`)

  const { command, args } = buildOpencodeArgs(job)
  let child: ChildProcess
  try {
    child = spawn(command, args, {
      cwd: workdir,
      env: buildRunEnvironment(),
      stdio: ["ignore", "pipe", "pipe"],
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    logStream.write(`\n=== Run error ${new Date().toISOString()} ===\n${message}\n`)
    logStream.end()
    updateJobRecord(job, {
      lastRunStatus: "failed",
      lastRunExitCode: undefined,
      lastRunError: message,
    })
    throw error
  }

  const runningJob = updateJobRecord(job, {
    lastRunAt: startedAt,
    lastRunSource: "manual",
    lastRunStatus: "running",
    lastRunExitCode: undefined,
    lastRunError: undefined,
  })

  if (child.stdout) child.stdout.pipe(logStream)
  if (child.stderr) child.stderr.pipe(logStream)

  child.on("error", (error) => {
    logStream.write(`\n=== Run error ${new Date().toISOString()} ===\n${error.message}\n`)
    logStream.end()
    updateJobRecord(job, {
      lastRunStatus: "failed",
      lastRunExitCode: undefined,
      lastRunError: error.message,
    })
  })

  child.on("close", (code) => {
    const exitCode = typeof code === "number" ? code : undefined
    logStream.write(`\n=== Run complete (${exitCode ?? "unknown"}) ${new Date().toISOString()} ===\n`)
    logStream.end()
    updateJobRecord(job, {
      lastRunStatus: exitCode === 0 ? "success" : "failed",
      lastRunExitCode: exitCode,
      lastRunError: exitCode === 0 ? undefined : `Exit code ${exitCode ?? "unknown"}`,
    })
  })

  return { startedAt, logPath, pid: child.pid, job: runningJob }
}

// === HELPERS ===

function describeCron(cron: string): string {
  const parts = cron.split(" ")
  if (parts.length !== 5) return cron

  const [min, hour, dom, mon, dow] = parts

  if (mon === "*" && dom === "*") {
    if (dow === "*" && hour !== "*" && min !== "*" && !hour.includes("*") && !hour.includes("/")) {
      const h = parseInt(hour)
      const m = parseInt(min)
      const ampm = h >= 12 ? "PM" : "AM"
      const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h
      return `daily at ${displayH}:${m.toString().padStart(2, "0")} ${ampm}`
    }
    if (hour.startsWith("*/")) {
      return `every ${hour.slice(2)} hours`
    }
    if (min.startsWith("*/")) {
      return `every ${min.slice(2)} minutes`
    }
  }

  if (dow !== "*" && dom === "*" && mon === "*") {
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const day = days[parseInt(dow)]
    if (day && hour !== "*") {
      const h = parseInt(hour)
      const ampm = h >= 12 ? "PM" : "AM"
      const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h
      return `${day}s at ${displayH}:${(min || "00").padStart(2, "0")} ${ampm}`
    }
  }

  return cron
}

function formatJobDetails(job: Job): string {
  const lines = [
    `Job: ${job.name}`,
    `Slug: ${job.slug}`,
    `Schedule: ${job.schedule} (${describeCron(job.schedule)})`,
    `Working Directory: ${job.workdir || homedir()}`,
  ]

  const run = (() => {
    try {
      return normalizeRunSpec(getJobRun(job))
    } catch {
      return undefined
    }
  })()

  if (run?.attachUrl) {
    lines.push(`Attach URL: ${run.attachUrl}`)
  } else if (job.attachUrl) {
    lines.push(`Attach URL: ${job.attachUrl}`)
  }

  if (run?.command) {
    lines.push(`Command: ${run.command}`)
    if (run.arguments) lines.push(`Arguments: ${run.arguments}`)
  }

  if (run?.prompt) {
    lines.push(`Prompt: ${run.prompt}`)
  } else if (job.prompt) {
    lines.push(`Prompt: ${job.prompt}`)
  }

  if (run?.files?.length) {
    lines.push(`Files: ${run.files.join(", ")}`)
  }

  if (run?.agent) {
    lines.push(`Agent: ${run.agent}`)
  }

  if (run?.model) {
    lines.push(`Model: ${run.model}`)
  }

  if (run?.variant) {
    lines.push(`Variant: ${run.variant}`)
  }

  if (run?.runFormat) {
    lines.push(`Run Format: ${run.runFormat}`)
  }

  if (run?.title) {
    lines.push(`Title: ${run.title}`)
  }

  if (run?.share) {
    lines.push("Share: true")
  }

  if (run?.continue) {
    lines.push("Continue: true")
  }

  if (run?.session) {
    lines.push(`Session: ${run.session}`)
  }

  // F1 back-compat: jobs scheduled before sessionPolicy was required
  // have no field — fall back to 'current' for display so the agent
  // sees the same effective semantics the runner / fire-time code
  // assumes for legacy jobs.
  lines.push(`Session Policy: ${getEffectiveSessionPolicy(job)}`)

  if (job.executionPolicy) {
    lines.push(`Execution Policy: ${job.executionPolicy}`)
  }

  if (job.deliveryPolicy) {
    lines.push(`Delivery Policy: ${job.deliveryPolicy}`)
  }

  if (run?.port !== undefined) {
    lines.push(`Port: ${run.port}`)
  }

  lines.push(`Created: ${job.createdAt}`)

  if (job.updatedAt) {
    lines.push(`Updated: ${job.updatedAt}`)
  }

  if (job.lastRunAt) {
    lines.push(`Last Run: ${job.lastRunAt}`)
  }

  if (job.lastRunSource) {
    lines.push(`Last Run Source: ${job.lastRunSource}`)
  }

  if (job.lastRunStatus) {
    lines.push(`Last Run Status: ${job.lastRunStatus}`)
  }

  if (job.lastRunExitCode !== undefined) {
    lines.push(`Last Exit Code: ${job.lastRunExitCode}`)
  }

  if (job.lastRunError) {
    lines.push(`Last Error: ${job.lastRunError}`)
  }

  return lines.join("\n")
}

function getJobLogs(job: Job, options?: { tailLines?: number; maxChars?: number }): string | null {
  const logPath = getLogPath(job)
  if (!existsSync(logPath)) return null

  const maxChars = options?.maxChars ?? 5000
  const tailLines = options?.tailLines

  try {
    if (typeof tailLines === "number" && Number.isFinite(tailLines) && tailLines > 0) {
      const clampedLines = Math.max(1, Math.min(5000, Math.floor(tailLines)))

      try {
        const output = execFileSync("tail", ["-n", String(clampedLines), logPath], {
          env: buildRunEnvironment(),
        }).toString()
        return output.length > maxChars ? output.slice(-maxChars) : output
      } catch {
        const content = readFileSync(logPath, "utf-8")
        const lines = content.split(/\r?\n/)
        const output = lines.slice(-clampedLines).join("\n")
        return output.length > maxChars ? output.slice(-maxChars) : output
      }
    }

    const content = readFileSync(logPath, "utf-8")
    return content.length > maxChars ? content.slice(-maxChars) : content
  } catch {
    return null
  }
}

/**
 * Resolve the base URL to use for a session-API call. Prefers a caller-
 * supplied `attachUrl` (typically pointing at a remote server) and falls
 * back to the in-process `serverUrl` provided by the plugin runtime.
 */
function resolveSessionApiBase(attachUrl: string | undefined, serverUrl: URL): string {
  if (attachUrl) return attachUrl.replace(/\/+$/, "")
  return serverUrl.toString().replace(/\/+$/, "")
}

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
        parentID?: string
        title?: string
        permission?: readonly ScheduledPermissionRule[]
      }
    }): Promise<{
      data?: { id?: string }
      // The SDK's runtime error is `BadRequestError` (`{ data, errors,
      // success }`); some hand-rolled mocks pass a `{ message }` form.
      // Accept both so tests don't need to mirror the full SDK shape.
      error?: BadRequestError | { message?: string }
    }>
  }
}

function getSchedulerSessionCreateErrorMessage(
  error: BadRequestError | { message?: string } | undefined,
): string {
  if (!error) return "unknown error"
  if ("message" in error && typeof error.message === "string") return error.message
  if ("errors" in error && Array.isArray(error.errors)) {
    const first = error.errors.find((e) => typeof e.message === "string")
    if (first && typeof first.message === "string") return first.message
  }
  return JSON.stringify(error)
}

/**
 * Create a local scheduler session through the plugin-provided client.
 * OpenCode wires that client to Server.App().fetch in-process; unlike
 * serverUrl, it does not require an externally listening HTTP port.
 */
export async function createSchedulerSessionWithClient(input: {
  client: SchedulerSessionClient
  title: string
  permission: readonly ScheduledPermissionRule[]
}): Promise<string> {
  const body = { title: input.title, permission: input.permission }
  const result = await input.client.session.create({ body })
  if (result.error) {
    throw new Error(`client.session.create failed: ${getSchedulerSessionCreateErrorMessage(result.error)}`)
  }
  if (!result.data?.id) {
    throw new Error("client.session.create returned no id")
  }
  return result.data.id
}

/**
 * Create a session via raw fetch for an explicit remote attachUrl target.
 * The plugin client is local-only, so remote session creation still needs
 * REST.
 */
async function createSchedulerSessionViaFetch(input: {
  baseUrl: string
  title: string
  permission: readonly ScheduledPermissionRule[]
}): Promise<string> {
  const res = await fetch(`${input.baseUrl}/session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: input.title, permission: input.permission }),
  })
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`POST /session failed: ${res.status} ${res.statusText} ${body}`.trim())
  }
  const json = (await res.json().catch(() => null)) as { id?: string } | null
  if (!json?.id) {
    throw new Error("POST /session returned no id")
  }
  return json.id
}

/**
 * Verify a session exists at the given base URL (GET /session/<id>).
 * Throws on 404 or network failure; returns silently on success.
 */
async function verifySessionExists(input: { baseUrl: string; sessionId: string }): Promise<void> {
  const res = await fetch(`${input.baseUrl}/session/${encodeURIComponent(input.sessionId)}`, {
    method: "GET",
    signal: AbortSignal.timeout(1500),
  })
  if (res.status === 404) {
    throw new Error(`Session ${input.sessionId} not found at ${input.baseUrl}`)
  }
  if (!res.ok) {
    throw new Error(`GET /session/${input.sessionId} failed: ${res.status} ${res.statusText}`)
  }
}

// === PLUGIN ===

export const SchedulerPlugin: Plugin = async ({ client, serverUrl }) => {
  // F5: publish our own runtime entry (when externally reachable) and
  // sweep entries left behind by previously-crashed opencode processes.
  // Side-effect-isolated; init failures never block plugin startup.
  initRegistryForPlugin({
    serverUrl,
    agent: process.stdout.isTTY ? "tui" : "headless",
  })

  return {
    tool: {
       schedule_job: tool({
           description:
            [
              "Create a NEW recurring scheduled job that fires an opencode prompt on a cron schedule.",
              "Trigger phrases: 'schedule', 'every day/hour/Monday at', 'recurring', 'daily', 'weekly',",
              "'automate', 'set up a cron', 'run X every N hours', 'background task on a timer'.",
              "Persists to an OS-level scheduler entry that survives reboots and runs whether opencode",
              "is open or not (this is NOT an in-process timer).",
              "NOT for one-off 'run this now' — use run_job. NOT for editing an existing job — use update_job.",
              "sessionPolicy is REQUIRED — no default. ALWAYS elicit the choice from the user explicitly,",
              "do not guess; a silent default leads to silent failures (job runs, TUI never refreshes).",
              "Options: 'current' (continues this chat — fine for reminders that should land in the",
              "current thread), 'new-per-job' (one fresh long-running session reused by every fire —",
              "best for independent background tasks), 'new-per-run' (a brand-new session every fire —",
              "best for stateless probes), 'existing' (user supplied an explicit sessionId).",
              "attachUrl is best-effort: omit it and the plugin auto-detects the serverUrl of the",
              "opencode you are running in (when launched with --port). Pass it explicitly only when",
              "targeting a different opencode server.",
              "Auto-installs the scheduled-job-best-practices skill into the workdir if not already",
              "present (idempotent; existing files are left untouched), so scheduled prompts can",
              "reference it via @scheduled-job-best-practices without a separate install_skill call.",
            ].join(" "),
          args: {
           name: tool.schema.string().describe("A short name for the job (e.g. 'standing desk search')"),
           schedule: tool.schema
             .string()
             .describe("Cron expression: '0 9 * * *' (daily 9am), '0 */6 * * *' (every 6h), '30 8 * * 1' (Monday 8:30am)"),
           prompt: tool.schema.string().optional().describe("Prompt to run (legacy; prefer run fields)"),
           command: tool.schema.string().optional().describe("Optional: opencode command to run (maps to --command)"),
           arguments: tool.schema.string().optional().describe("Optional: arguments string for command mode"),
           files: tool.schema
             .string()
             .optional()
             .describe("Optional: comma-separated list of files/dirs to attach (maps to repeated --file)"),
           agent: tool.schema.string().optional().describe("Optional: agent to use (maps to --agent)"),
           model: tool.schema.string().optional().describe("Optional: model to use (maps to --model)"),
           variant: tool.schema.string().optional().describe("Optional: model variant (maps to --variant)"),
           title: tool.schema.string().optional().describe("Optional: session title (maps to --title)"),
           share: tool.schema.boolean().optional().describe("Optional: share session (maps to --share)"),
           continue: tool.schema.boolean().optional().describe("Optional: continue last session (maps to --continue)"),
           session: tool.schema.string().optional().describe("Optional: session id (maps to --session)"),
           runFormat: tool.schema
             .string()
             .optional()
             .describe("Optional: run output format (maps to opencode --format: default|json)"),
           port: tool.schema.number().optional().describe("Optional: server port for local server (maps to --port)"),
           source: tool.schema.string().optional().describe("Optional: source app (e.g. 'marketplace') - used for filtering"),
           workdir: tool.schema
             .string()
             .optional()
             .describe("Optional: working directory to run from (for MCP config). Defaults to current directory."),
            attachUrl: tool.schema
              .string()
              .optional()
              .describe("Optional: attach URL for opencode run (e.g. http://localhost:4096)."),
            sessionPolicy: tool.schema
              .string()
              .describe(
                "REQUIRED — no default. Ask the user which policy fits before calling. 'current' (continues this chat — for reminders into the live thread; needs a TUI launched with --port for live in-TUI delivery, otherwise the message lands in storage but the open TUI does not refresh until reopen), 'existing' (write into an explicit sessionId — supply sessionId), 'new-per-job' (one fresh session reused by every fire — for independent long-running background tasks), 'new-per-run' (a brand-new session every fire — for stateless probes)."
              ),
            sessionId: tool.schema
              .string()
              .optional()
              .describe("Optional: explicit session id (required when sessionPolicy='existing')."),
            executionPolicy: tool.schema
              .string()
              .optional()
              .describe(
                "Optional: 'prefer-live-server' (default; live HTTP delivery if reachable, else headless) or 'headless-only' (always spawn CLI, no live HTTP)."
              ),
            deliveryPolicy: tool.schema
              .string()
              .optional()
              .describe(
                "Optional: 'execute' (default; wait for idle session) or 'leave-message' (post immediately with noReply, user picks up later)."
              ),
            timeoutSeconds: tool.schema
              .number()
              .optional()
              .describe("Optional: max runtime in seconds (0 disables)."),
            format: tool.schema.string().optional().describe("Optional: output format ('text' or 'json')."),
          },

          async execute(args, ctx) {
            const format = normalizeFormat(args.format)
            const slug = args.source ? `${args.source}-${slugify(args.name)}` : slugify(args.name)

            const workdir = normalizeWorkdirPath(args.workdir || process.cwd())
            const scopeId = deriveScopeId(workdir)

            // Auto-install the best-practices skill into this workdir so the
            // agent can `@scheduled-job-best-practices` it from the prompt
            // without a separate install_skill round-trip. Idempotent: present
            // files are left untouched.
            const skillEnsure = ensureBestPracticesSkill(workdir)

            if (loadScopedJob(scopeId, slug)) {
              return errorResult(
                format,
                `Job "${slug}" already exists in this workspace scope (${scopeId}). Delete it first or use a different name.`
              )
            }

            if (loadLegacyJob(slug)) {
              return errorResult(
                format,
                `Job "${slug}" already exists (legacy scheduler storage). Delete it first or use a different name.`
              )
            }

           const parseFiles = (raw?: unknown): string[] | undefined => {
             if (raw === undefined) return undefined
             if (typeof raw !== "string") return undefined
             const items = raw
               .split(",")
               .map((item) => item.trim())
               .filter(Boolean)
             return items.length ? items : undefined
           }

           let runFormat: OpencodeRunFormat | undefined
           try {
             runFormat = parseRunFormatInput(args.runFormat)
           } catch (error) {
             const msg = error instanceof Error ? error.message : String(error)
             return errorResult(format, msg)
           }

           const run: JobRunSpec = {
             prompt: args.prompt,
             command: args.command,
             arguments: args.arguments,
             files: parseFiles(args.files),
             agent: args.agent,
             model: args.model,
             variant: args.variant,
             title: args.title,
             share: args.share,
             continue: args.continue,
             session: args.session,
             runFormat,
             attachUrl: args.attachUrl,
             port: args.port,
           }

           try {
             validateRunSpec(normalizeRunSpec(run))
           } catch (error) {
             const msg = error instanceof Error ? error.message : String(error)
             return errorResult(format, `Invalid run spec: ${msg}`)
           }

           // Validate the explicit attachUrl arg first, so we surface a
           // bad URL before any other policy-side resolution. The return
           // value is intentionally discarded — `resolveEffectiveAttachUrl`
           // (called later, after sessionPolicy is parsed) re-runs
           // normalizeAttachUrl on the same input as part of F2b auto-
           // promotion. This pre-check exists purely to fail fast with a
           // clean error before the agent has to read past sessionPolicy
           // / executionPolicy / deliveryPolicy errors. Do NOT delete as
           // dead code.
           try {
             normalizeAttachUrl(args.attachUrl)
           } catch (error) {
             const msg = error instanceof Error ? error.message : String(error)
             return errorResult(format, msg)
           }

           try {
             validateCronExpression(args.schedule)
           } catch (error) {
             const msg = error instanceof Error ? error.message : String(error)
             return errorResult(format, `Invalid cron schedule: ${msg}`)
           }

           // === Session policy resolution (S4 + F1) ===
           // F1: parseSessionPolicy throws on missing/empty. The Zod
           // schema also requires it, but we keep the runtime check as
           // defence in depth (e.g. if a caller bypasses validation by
           // synthesizing a tool input directly).
           let sessionPolicy: SessionPolicy
           try {
             sessionPolicy = parseSessionPolicy(args.sessionPolicy)
           } catch (error) {
             const msg = error instanceof Error ? error.message : String(error)
             return errorResult(format, msg)
           }

           let executionPolicy: ExecutionPolicy
           try {
             executionPolicy = parseExecutionPolicy(args.executionPolicy)
           } catch (error) {
             const msg = error instanceof Error ? error.message : String(error)
             return errorResult(format, msg)
           }

           let deliveryPolicy: DeliveryPolicy
           try {
             deliveryPolicy = parseDeliveryPolicy(args.deliveryPolicy)
           } catch (error) {
             const msg = error instanceof Error ? error.message : String(error)
             return errorResult(format, msg)
           }

           // === Effective attachUrl (F2a + F2b) ===
           // - explicit arg wins,
           // - external serverUrl auto-promotes (F2b) ONLY when the
           //   user did not opt into headless-only,
           // - internal serverUrl + current/existing flags a warning (F2a).
           let effectiveAttachUrl: ReturnType<typeof resolveEffectiveAttachUrl>
           try {
             effectiveAttachUrl = resolveEffectiveAttachUrl({
               argAttachUrl: args.attachUrl,
               serverUrl,
               sessionPolicy,
               executionPolicy,
             })
           } catch (error) {
             const msg = error instanceof Error ? error.message : String(error)
             return errorResult(format, msg)
           }
           const attachUrl = effectiveAttachUrl.attachUrl

           // S6: validation matrix.
           const policyError = validateSessionPolicyArgs({
             sessionPolicy,
             executionPolicy,
             deliveryPolicy,
             sessionId: args.sessionId,
             attachUrl,
             toolSessionID: ctx?.sessionID,
           })
           if (policyError) {
             return errorResult(format, policyError)
           }

           // Resolve effective session id at schedule-time per policy.
           const sessionApiBase = resolveSessionApiBase(attachUrl, serverUrl)
           let resolvedSessionId: string | undefined

           if (sessionPolicy === "current") {
             resolvedSessionId = (args.sessionId ?? "").trim() || ctx?.sessionID
             if (resolvedSessionId && attachUrl) {
               try {
                 await verifySessionExists({ baseUrl: sessionApiBase, sessionId: resolvedSessionId })
               } catch (error) {
                 const msg = error instanceof Error ? error.message : String(error)
                 return errorResult(format, `sessionPolicy='current': ${msg}`)
               }
             }
           } else if (sessionPolicy === "existing") {
             resolvedSessionId = (args.sessionId ?? "").trim()
             if (attachUrl) {
               try {
                 await verifySessionExists({ baseUrl: sessionApiBase, sessionId: resolvedSessionId! })
               } catch (error) {
                 const msg = error instanceof Error ? error.message : String(error)
                 return errorResult(format, `sessionPolicy='existing': ${msg}`)
               }
             }
           } else if (sessionPolicy === "new-per-job") {
             try {
               resolvedSessionId = attachUrl
                 ? await createSchedulerSessionViaFetch({
                     baseUrl: sessionApiBase,
                     title: args.name,
                     permission: SCHEDULED_PERMS,
                   })
                 : await createSchedulerSessionWithClient({
                     client,
                     title: args.name,
                     permission: SCHEDULED_PERMS,
                   })
             } catch (error) {
               const msg = error instanceof Error ? error.message : String(error)
               return errorResult(format, `sessionPolicy='new-per-job': ${msg}`)
             }
           }
           // new-per-run: leave resolvedSessionId undefined; runner creates per fire.

           // Capture per-job env snapshot. loadSchedulerConfig() throws on
           // invalid env.mode / denylisted env.set keys — route through the
           // same errorResult pipeline as every other validation failure.
           let capturedEnv: JobEnv
           try {
             capturedEnv = captureJobEnv(loadSchedulerConfig().env)
           } catch (error) {
             const msg = error instanceof Error ? error.message : String(error)
             return errorResult(format, `Failed to capture env: ${msg}`)
           }

           // Promote resolved session into the run spec so buildOpencodeArgs
           // emits `--session <id>` (and optional `--attach`).
           if (resolvedSessionId) {
             run.session = resolvedSessionId
           }
           if (attachUrl) {
             run.attachUrl = attachUrl
           }

            const job: Job = {
              scopeId,
              slug,
              name: args.name,
              schedule: args.schedule,
              run: normalizeRunSpec(run),
              // keep legacy fields as well for backwards-compat / readability
              prompt: args.prompt,
              source: args.source,
              workdir,
              attachUrl,
              sessionPolicy,
              executionPolicy,
              deliveryPolicy,
              timeoutSeconds: args.timeoutSeconds,
              env: capturedEnv,
              createdAt: new Date().toISOString(),
            }

            // Snapshot both invocations:
            // - invocation:           live-capable form (with --attach if set)
            // - headlessInvocation:   no --attach; subprocess fallback for the runner
            try {
              job.invocation = buildOpencodeArgs(job)
              job.headlessInvocation = buildOpencodeArgs(job, { withAttachUrl: false })
            } catch (error) {
              const msg = error instanceof Error ? error.message : String(error)
              return errorResult(format, `Failed to build invocation: ${msg}`)
            }


           try {
             saveJob(job)
             const backend = installJob(job)

             const platformName = backend
             const reliabilityLine = backend === "schtasks"
               ? "Windows note: scheduled runs use Task Scheduler directly. For advanced reliability guarantees, prefer simple cron schedules or split complex jobs."
               : backend === "cron"
                 ? "Cron note: missed runs during sleep are not replayed. For catch-up behavior, use launchd or systemd when available."
                 : "The job will run at the scheduled time. If your computer was asleep, it will catch up when it wakes."
             const primaryLine = run.command
               ? `Command: ${run.command}${run.arguments ? ` ${run.arguments}` : ""}`
               : `Prompt: ${(run.prompt ?? "").slice(0, 100)}${(run.prompt ?? "").length > 100 ? "..." : ""}`

             const successText = formatScheduleJobSuccess({
               name: args.name,
               schedule: args.schedule,
               scheduleHuman: describeCron(args.schedule),
               platformName,
               workdir,
               attachUrl: run.attachUrl,
               attachUrlAutoFromServerUrl: effectiveAttachUrl.autoFromServerUrl,
               primaryLine,
               skillEnsure,
               internalWarning: effectiveAttachUrl.internalWarning,
               reliabilityLine,
             })

             // Metadata block is exposed in the JSON-format response
             // for debugging / observability. The shape is NOT a stable
             // contract — downstream consumers should NOT key off
             // `attachUrlSource` / `internalServerWarning` programmatically;
             // those are documentation aids whose names and values may
             // change between minor versions. Use the rendered text in
             // the success output as the user-facing source of truth.
             return okResult(format, successText, {
               job,
               skill: skillEnsure,
               attachUrlSource: effectiveAttachUrl.autoFromServerUrl ? "serverUrl-auto" : (attachUrl ? "explicit" : "none"),
               internalServerWarning: effectiveAttachUrl.internalWarning,
             })

          } catch (error) {
            deleteJobFile(job)
            const msg = error instanceof Error ? error.message : String(error)
            return errorResult(format, `Failed to schedule job: ${msg}`)
          }
        },
      }),

      list_jobs: tool({
        description: [
          "List existing scheduled jobs in the current project workdir (or across all projects with",
          "allScopes=true). Trigger phrases: 'what jobs do I have', 'show my schedules', 'list cron',",
          "'any active scheduled tasks', 'what's scheduled', 'show scheduler jobs'.",
          "Read-only and cheap. Use this BEFORE update_job / delete_job / run_job / get_job / job_logs",
          "when the user refers to a job by description rather than exact slug, so you can resolve",
          "the right slug. Returns name, slug, schedule, last run status, and sessionPolicy per job.",
        ].join(" "),
        args: {
          source: tool.schema.string().optional().describe("Filter by source app (e.g. 'marketplace')"),
          allScopes: tool.schema.boolean().optional().describe("List jobs across all scopes."),
          includeLegacy: tool.schema.boolean().optional().describe("Include legacy jobs from ~/.config/opencode/jobs"),
          scopeRoot: tool.schema
            .string()
            .optional()
            .describe("Optional: scope root directory (defaults to current directory)."),
          format: tool.schema.string().optional().describe("Optional: output format ('text' or 'json')."),
        },

        async execute(args) {
          const format = normalizeFormat(args.format)

          const scopeId = args.allScopes
            ? undefined
            : deriveScopeId(normalizeWorkdirPath(args.scopeRoot || process.cwd()))

          let jobs = args.allScopes ? loadAllJobsAcrossScopes() : loadAllScopedJobs(scopeId!)

          if (args.includeLegacy) {
            jobs = [...jobs, ...loadAllLegacyJobs()]
          }

          if (args.source) {
            jobs = jobs.filter((j) => j.source === args.source || j.slug.startsWith(`${args.source}-`))
          }

          if (jobs.length === 0) {
            const message = args.source
              ? `No jobs found for "${args.source}".`
              : 'No scheduled jobs yet.\n\nTry: "Schedule a daily job at 9am to search for standing desks"'
            return okResult(format, message, { jobs: [] })
          }

          const lines = jobs.map((j, i) => {
            const run = (() => {
              try {
                return normalizeRunSpec(getJobRun(j))
              } catch {
                return undefined
              }
            })()

            const preview = run?.command
              ? `${run.command}${run.arguments ? ` ${run.arguments}` : ""}`
              : run?.prompt ?? j.prompt ?? "(missing prompt)"

            const trimmed = preview.trim()
            const snippet = trimmed.slice(0, 50) + (trimmed.length > 50 ? "..." : "")

            return `${i + 1}. ${j.name} (${j.slug})
   ${describeCron(j.schedule)}
   ${snippet}`
          })


          return okResult(format, `Scheduled Jobs\n\n${lines.join("\n\n")}`, { jobs })
        },
      }),

      get_version: tool({
        description: [
          "Report the opencode-scheduler plugin version and the resolved opencode binary path/version.",
          "Trigger phrases: 'what version', 'is the scheduler installed', 'which opencode is being used',",
          "'show plugin version', 'debug scheduler setup'. Read-only. Use before troubleshooting to",
          "confirm which plugin build is loaded and which opencode executable will run scheduled jobs.",
        ].join(" "),
        args: {
          format: tool.schema.string().optional().describe("Optional: output format ('text' or 'json')."),
        },
        async execute(args) {
          const format = normalizeFormat(args.format)
          const packageInfo = loadPackageInfo()
          const opencodePath = findOpencode()
          const opencodeVersion = getOpencodeVersion(opencodePath)
          const lines = [
            `Scheduler Plugin: ${packageInfo.name}@${packageInfo.version}`,
            `Opencode Binary: ${opencodePath}`,
            `Opencode Version: ${opencodeVersion ?? "unknown"}`,
          ]

          return okResult(format, lines.join("\n"), {
            plugin: packageInfo,
            opencode: { path: opencodePath, version: opencodeVersion },
            platform: platform(),
          })
        },
      }),

      get_skill: tool({
        description: [
          "Return the source text of a built-in skill template without writing it to disk.",
          "Currently bundles 'scheduled-job-best-practices' (sessionPolicy / delivery / env parity /",
          "auto-permissions / runtime date snippets / idempotency patterns).",
          "Trigger phrases: 'show the skill', 'what does the best-practices skill contain', 'preview",
          "the scheduler skill', 'how should I write a scheduled prompt'. Read-only.",
          "To actually install the skill into the repo (.opencode/skill/<name>/SKILL.md) use install_skill.",
          "Read this BEFORE writing a non-trivial scheduled prompt to follow the documented patterns.",
        ].join(" "),
        args: {
          name: tool.schema
            .string()
            .optional()
            .describe("Skill name (default: scheduled-job-best-practices)"),
          format: tool.schema.string().optional().describe("Optional: output format ('text' or 'json')."),
        },
        async execute(args) {
          const format = normalizeFormat(args.format)
          const skill = getBuiltinSkill(args.name)

          if (!skill) {
            const available = listBuiltinSkills()
              .map((s) => s.name)
              .join(", ")
            const requested = (args.name ?? "").trim()
            const label = requested ? `"${requested}"` : "that name"
            return errorResult(format, `No built-in skill found for ${label}. Available: ${available || "(none)"}`)
          }

          const renderedFiles = Object.entries(skill.files)
            .map(([filename, content]) => `--- ${filename} ---\n${content.trim()}\n`)
            .join("\n")

          const output = [
            `Skill: ${skill.name}`,
            `Description: ${skill.description}`,
            `Suggested path: ${skill.suggestedPath}`,
            "",
            "Copy the file(s) below into your repo:",
            "",
            renderedFiles,
          ].join("\n")

          return okResult(format, output, { skill })
        },
      }),

      install_skill: tool({
        description: [
          "Write a built-in skill template into .opencode/skill/<name>/SKILL.md in the current repo so",
          "scheduled prompts can reference it via @<name>.",
          "Trigger phrases: 'install the skill', 'add the best-practices skill to my project',",
          "'set up scheduled-job-best-practices', 'I want to @-reference the skill in my prompt'.",
          "Mutates repo files (creates a directory + writes SKILL.md). Idempotent overwrite.",
          "Use get_skill first if the user only wants to read the template without writing it.",
        ].join(" "),
        args: {
          name: tool.schema
            .string()
            .optional()
            .describe("Skill name (default: scheduled-job-best-practices)"),
          directory: tool.schema
            .string()
            .optional()
            .describe("Repo root directory to install into (defaults to current directory)."),
          overwrite: tool.schema.boolean().optional().describe("Overwrite existing files (default false)."),
          format: tool.schema.string().optional().describe("Optional: output format ('text' or 'json')."),
        },
        async execute(args) {
          const format = normalizeFormat(args.format)
          const skill = getBuiltinSkill(args.name)

          if (!skill) {
            const available = listBuiltinSkills()
              .map((s) => s.name)
              .join(", ")
            const requested = (args.name ?? "").trim()
            const label = requested ? `"${requested}"` : "that name"
            return errorResult(format, `No built-in skill found for ${label}. Available: ${available || "(none)"}`)
          }

          const directory = args.directory ?? process.cwd()
          const overwrite = args.overwrite === true

          try {
            const installed = installBuiltinSkill(skill, directory, overwrite)
            const files = installed.files.map((file) => `- ${file}`).join("\n")

            const output = [
              `Installed skill: ${skill.name}`,
              `Directory: ${installed.directory}`,
              "",
              "Files:",
              files,
              "",
              `Next: add @${skill.name} to the top of scheduled job prompts.`,
            ].join("\n")

            return okResult(format, output, { skill, installed })
          } catch (error) {
            const msg = error instanceof Error ? error.message : String(error)
            return errorResult(format, `Failed to install skill: ${msg}`)
          }
        },
      }),

      install_server_config: tool({
        description: [
          "Write `server.port` (default 0) into ~/.config/opencode/opencode.json so every opencode start",
          "picks a TCP port and registers itself with the F5 plugin-side runtime registry — closing the",
          "loop where scheduled jobs scheduled without an explicit `attachUrl` can be auto-discovered at",
          "fire-time. Trigger phrases: 'install server config', 'enable port-0 in opencode config',",
          "'set up auto-attach', 'configure opencode to listen on a port'.",
          "Single-purpose, idempotent. Strictly limited to that one config file — does NOT touch shell rc",
          "files, environment, launchd plists, or anything else.",
          "Two-step UX: call without `confirm: true` first to get a preview + diff; call again with",
          "`confirm: true` to actually write. If the config already has `server.port` set to a different",
          "value, also pass `overwrite: true` to replace it (preview surfaces the previous value first).",
          "After a successful write the user must restart opencode for it to take effect — `server.port`",
          "is read at startup, not live-reloaded. Requires the F7 upstream Zod schema fix to accept",
          "`port: 0`; on a pre-F7 opencode pass an explicit positive port instead.",
        ].join(" "),
        args: {
          port: tool.schema
            .number()
            .optional()
            .describe(
              `Port to write into server.port. Default ${DEFAULT_SERVER_PORT} (= try 4096, then OS-assigned random — matches CLI --port 0). Pass a positive port (e.g. 4096) when the host opencode predates the F7 schema fix.`,
            ),
          overwrite: tool.schema
            .boolean()
            .optional()
            .describe("Allow replacing an existing server.port set to a different value (default false)."),
          confirm: tool.schema
            .boolean()
            .optional()
            .describe("Required to actually write the file. Without this the tool returns a dry-run preview only."),
          configPath: tool.schema
            .string()
            .optional()
            .describe(`Override config file path (defaults to ${DEFAULT_OPENCODE_CONFIG_PATH}).`),
          format: tool.schema.string().optional().describe("Optional: output format ('text' or 'json')."),
        },
        async execute(args) {
          const format = normalizeFormat(args.format)
          const result = executeInstallServerConfig({
            port: args.port,
            overwrite: args.overwrite,
            confirm: args.confirm,
            configPath: args.configPath,
          })
          const text = formatInstallServerConfigResult(result)
          if (result.ok) {
            return okResult(format, text, { result })
          }
          return errorResult(format, text, { result })
        },
      }),

      get_job: tool({

        description: [
          "Fetch full metadata for ONE scheduled job by name or slug: cron schedule, prompt, sessionPolicy,",
          "attachUrl, env mode, last run timestamp, last run status, exit code, log path.",
          "Trigger phrases: 'show details for X', 'what does the X job do', 'when did X last run',",
          "'inspect job', 'what's the schedule for X', 'show config for X job'.",
          "Read-only. Use BEFORE update_job to know the current values, or after run_job to confirm",
          "lastRun fields. If the user refers to the job vaguely, run list_jobs first to resolve the slug.",
        ].join(" "),
        args: {
          name: tool.schema.string().describe("The job name or slug"),
          format: tool.schema.string().optional().describe("Optional: output format ('text' or 'json')."),
        },
        async execute(args) {
          const format = normalizeFormat(args.format)
          const job = findJobByName(args.name)

          if (!job) {
            return errorResult(format, `Job "${args.name}" not found.`)
          }

          return okResult(format, formatJobDetails(job), { job })
        },
      }),

      update_job: tool({
        description: [
          "Modify fields on an EXISTING scheduled job: cron schedule, prompt, sessionPolicy / sessionId,",
          "executionPolicy, deliveryPolicy, attachUrl, timeoutSeconds, model, agent, files.",
          "Trigger phrases: 'change', 'update', 'edit', 'move X to 10am', 'change schedule', 'switch X",
          "to a different model', 'point job at this attachUrl', 'add files to job'.",
          "Reinstalls the OS scheduler entry (launchd / systemd / Task Scheduler / cron line) — safe to",
          "re-run on the same job. Requires the job to already exist. Run list_jobs / get_job first if",
          "the slug is ambiguous. NOT for creating a new job — use schedule_job.",
        ].join(" "),
        args: {
          name: tool.schema.string().describe("The job name or slug"),
          schedule: tool.schema.string().optional().describe("Updated cron expression"),

          // Legacy prompt field
          prompt: tool.schema.string().optional().describe("Updated prompt (legacy; prefer command/arguments/etc)"),

          command: tool.schema.string().optional().describe("Updated opencode command (maps to --command)"),
          arguments: tool.schema.string().optional().describe("Updated command arguments string"),
          files: tool.schema
            .string()
            .optional()
            .describe("Updated comma-separated list of files/dirs to attach"),
          agent: tool.schema.string().optional().describe("Updated agent (maps to --agent)"),
          model: tool.schema.string().optional().describe("Updated model (maps to --model)"),
          variant: tool.schema.string().optional().describe("Updated model variant (maps to --variant)"),
          title: tool.schema.string().optional().describe("Updated session title (maps to --title)"),
          share: tool.schema.boolean().optional().describe("Updated share flag (maps to --share)"),
          continue: tool.schema.boolean().optional().describe("Updated continue flag (maps to --continue)"),
          session: tool.schema.string().optional().describe("Updated session id (maps to --session)"),
          runFormat: tool.schema
            .string()
            .optional()
            .describe("Updated run output format (default|json)"),
          port: tool.schema.number().optional().describe("Updated port (maps to --port)"),

          timeoutSeconds: tool.schema.number().optional().describe("Updated timeout in seconds (0 disables)"),

          workdir: tool.schema.string().optional().describe("Updated working directory"),
          attachUrl: tool.schema.string().optional().describe("Updated attach URL (set to empty to clear)"),
          format: tool.schema.string().optional().describe("Optional: output format ('text' or 'json')."),
        },
        async execute(args) {
          const format = normalizeFormat(args.format)
          const job = findJobByName(args.name)

          if (!job) {
            return errorResult(format, `Job "${args.name}" not found.`)
          }

          const updates: Partial<Job> = {}

          const parseFiles = (raw?: unknown): string[] | undefined => {
            if (raw === undefined) return undefined
            if (typeof raw !== "string") return undefined
            const items = raw
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
            return items.length ? items : undefined
          }

          // Start with existing run spec (or legacy prompt) and apply updates.
          const currentRun = (() => {
            try {
              return normalizeRunSpec(getJobRun(job))
            } catch {
              return {}
            }
          })()

          const nextRunCandidate: JobRunSpec = {
            ...currentRun,
            prompt: args.prompt !== undefined ? args.prompt : currentRun.prompt,
            command: args.command !== undefined ? args.command : currentRun.command,
            arguments: args.arguments !== undefined ? args.arguments : currentRun.arguments,
            files: args.files !== undefined ? parseFiles(args.files) : currentRun.files,
            agent: args.agent !== undefined ? args.agent : currentRun.agent,
            model: args.model !== undefined ? args.model : currentRun.model,
            variant: args.variant !== undefined ? args.variant : currentRun.variant,
            title: args.title !== undefined ? args.title : currentRun.title,
            share: args.share !== undefined ? args.share : currentRun.share,
            continue: args.continue !== undefined ? args.continue : currentRun.continue,
            session: args.session !== undefined ? args.session : currentRun.session,
            runFormat: args.runFormat !== undefined ? parseRunFormatInput(args.runFormat) : currentRun.runFormat,
            attachUrl: args.attachUrl !== undefined ? args.attachUrl : currentRun.attachUrl,
            port: args.port !== undefined ? args.port : currentRun.port,
          }

          try {
            updates.run = normalizeRunSpec(nextRunCandidate)
          } catch (error) {
            const msg = error instanceof Error ? error.message : String(error)
            return errorResult(format, `Invalid run spec: ${msg}`)
          }

          if (args.schedule !== undefined) {
            if (!args.schedule.trim()) {
              return errorResult(format, "Schedule cannot be empty.")
            }
            try {
              validateCronExpression(args.schedule)
            } catch (error) {
              const msg = error instanceof Error ? error.message : String(error)
              return errorResult(format, `Invalid cron schedule: ${msg}`)
            }
            updates.schedule = args.schedule
          }

          if (args.prompt !== undefined) {
            if (!args.prompt.trim()) {
              return errorResult(format, "Prompt cannot be empty.")
            }
            // Keep legacy prompt field in sync if provided.
            updates.prompt = args.prompt
          }

          if (args.workdir !== undefined) {
            if (!args.workdir.trim()) {
              return errorResult(format, "Working directory cannot be empty.")
            }
            const normalizedWorkdir = normalizeWorkdirPath(args.workdir)
            updates.workdir = normalizedWorkdir
            updates.scopeId = deriveScopeId(normalizedWorkdir)
          }

          if (args.attachUrl !== undefined) {
            try {
              updates.attachUrl = normalizeAttachUrl(args.attachUrl)
            } catch (error) {
              const msg = error instanceof Error ? error.message : String(error)
              return errorResult(format, msg)
            }
          }

          if (args.timeoutSeconds !== undefined) {
            updates.timeoutSeconds = args.timeoutSeconds
          }

          if (Object.keys(updates).length === 0) {
            return errorResult(format, "No updates provided.")
          }

          const updatedJob: Job = {
            ...job,
            ...updates,
            updatedAt: new Date().toISOString(),
          }

          // Keep scheduled invocation snapshot up-to-date.
          try {
            updatedJob.invocation = buildOpencodeArgs(updatedJob)
            updatedJob.headlessInvocation = buildOpencodeArgs(updatedJob, { withAttachUrl: false })
          } catch (error) {
            const msg = error instanceof Error ? error.message : String(error)
            return errorResult(format, `Failed to build invocation: ${msg}`)
          }

          try {
            const oldScopeId = job.scopeId || deriveScopeId(job.workdir || homedir())
            const nextScopeId = updatedJob.scopeId || deriveScopeId(updatedJob.workdir || homedir())
            const scopeChanged = oldScopeId !== nextScopeId

            if (scopeChanged) {
              // Uninstall old schedule before installing the new one, to avoid overlapping runs.
              uninstallJob(job)
            }

            saveJob(updatedJob)
            installJob(updatedJob)

            if (scopeChanged) {
              // Remove the old job file if it exists.
              const oldPath = jobFilePath(oldScopeId, job.slug)
              if (existsSync(oldPath)) {
                try {
                  unlinkSync(oldPath)
                } catch {}
              }
            }
            return okResult(format, `Updated job "${updatedJob.name}"`, { job: updatedJob })
          } catch (error) {
            const msg = error instanceof Error ? error.message : String(error)
            // Best-effort rollback: restore original job and schedule.
            try {
              saveJob(job)
              installJob(job)
            } catch {}
            return errorResult(format, `Failed to update job: ${msg}`)
          }
        },
      }),

      delete_job: tool({
        description: [
          "Remove a single scheduled job: deletes the job definition AND uninstalls its OS scheduler",
          "entry (launchd plist / systemd unit / Task Scheduler task / cron line). Logs are kept.",
          "Trigger phrases: 'delete X', 'remove the X job', 'stop the X schedule', 'cancel scheduled X',",
          "'unschedule X', 'kill the cron for X'.",
          "Single job only. For wiping ALL jobs across all projects use cleanup_global. Destructive: the",
          "schedule will not fire again. Recreate via schedule_job if needed. Resolve slug via list_jobs",
          "if the user is vague.",
        ].join(" "),
        args: {
          name: tool.schema.string().describe("The job name or slug to delete"),
          format: tool.schema.string().optional().describe("Optional: output format ('text' or 'json')."),
        },
        async execute(args) {
          const format = normalizeFormat(args.format)
          const job = findJobByName(args.name)

          if (!job) {
            return errorResult(format, `Job "${args.name}" not found.`)
          }

          uninstallJob(job)
          deleteJobFile(job)

          // Best-effort: remove legacy job file if present.
          const legacyPath = join(LEGACY_JOBS_DIR, `${job.slug}.json`)
          if (existsSync(legacyPath)) {
            try {
              unlinkSync(legacyPath)
            } catch {}
          }

          return okResult(format, `Deleted job "${job.name}"`, { job })
        },
      }),

      cleanup_global: tool({
        description: [
          "GLOBAL nuke of scheduler artifacts across ALL projects on this machine: every job definition,",
          "every OS scheduler entry, every lock file. Optionally also logs and run history.",
          "Trigger phrases: 'clean up everything', 'reset the scheduler', 'wipe all scheduled jobs',",
          "'remove all cron entries created by the plugin', 'global cleanup', 'nuke scheduler state'.",
          "DESTRUCTIVE and IRREVERSIBLE. Always defaults to dry-run; pass confirm:true to actually",
          "delete. Reports counts grouped by location. NEVER call without explicit user intent — for",
          "removing one job use delete_job instead. Affects every workdir/scope, not just the current one.",
        ].join(" "),
        args: {
          includeHistory: tool.schema
            .boolean()
            .optional()
            .describe("Also remove run history and logs across all scopes (default false)."),
          confirm: tool.schema
            .boolean()
            .optional()
            .describe("Set true to execute deletion. Default is dry run with no destructive changes."),
          format: tool.schema.string().optional().describe("Optional: output format ('text' or 'json')."),
        },
        async execute(args) {
          const format = normalizeFormat(args.format)
          const includeHistory = args.includeHistory === true
          const dryRun = args.confirm !== true

          const plan = buildGlobalCleanupPlan(includeHistory)
          const execution = executeGlobalCleanup(plan, { dryRun, includeHistory })
          const output = formatGlobalCleanupOutput(execution)

          return okResult(format, output, {
            dryRun: execution.dryRun,
            includeHistory: execution.includeHistory,
            removed: execution.removed,
            errors: execution.errors,
            scopeIds: plan.scopeIds,
            jobsConsidered: plan.jobsToUninstall.length,
          })
        },
      }),

      run_job: tool({
        description: [
          "Fire an existing scheduled job ONCE immediately, outside its cron schedule. Fire-and-forget.",
          "Trigger phrases: 'run X now', 'trigger', 'test the job', 'execute X manually', 'fire it now',",
          "'kick off X', 'run job out of band', 'check if it works'.",
          "Does NOT change the cron schedule or any job config. Output appends to the same log file as",
          "scheduled runs (read with job_logs). Useful for testing a freshly created or updated job",
          "without waiting for its next scheduled tick. NOT for creating a new job — use schedule_job.",
          "Resolve slug via list_jobs if needed.",
        ].join(" "),
        args: {
          name: tool.schema.string().describe("The job name or slug"),
          // Optional overrides for a one-off run
          prompt: tool.schema.string().optional().describe("Override prompt for this run"),
          command: tool.schema.string().optional().describe("Override command for this run"),
          arguments: tool.schema.string().optional().describe("Override arguments for command mode"),
          files: tool.schema.string().optional().describe("Override comma-separated files/dirs to attach"),
          agent: tool.schema.string().optional().describe("Override agent"),
          model: tool.schema.string().optional().describe("Override model"),
          variant: tool.schema.string().optional().describe("Override variant"),
          title: tool.schema.string().optional().describe("Override title"),
          share: tool.schema.boolean().optional().describe("Override share flag"),
          continue: tool.schema.boolean().optional().describe("Override continue flag"),
          session: tool.schema.string().optional().describe("Override session id"),
          runFormat: tool.schema.string().optional().describe("Override run output format (default|json)"),
          port: tool.schema.number().optional().describe("Override port"),
          attachUrl: tool.schema.string().optional().describe("Override attach URL"),
          format: tool.schema.string().optional().describe("Optional: output format ('text' or 'json')."),
        },
        async execute(args) {
          const format = normalizeFormat(args.format)
          const job = findJobByName(args.name)

          if (!job) {
            return errorResult(format, `Job "${args.name}" not found. Use list_jobs to see available jobs.`)
          }

          const parseFiles = (raw?: unknown): string[] | undefined => {
            if (raw === undefined) return undefined
            if (typeof raw !== "string") return undefined
            const items = raw
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean)
            return items.length ? items : undefined
          }

          const baseRun = (() => {
            try {
              return normalizeRunSpec(getJobRun(job))
            } catch {
              return {}
            }
          })()

          const overrideCandidate: JobRunSpec = {
            ...baseRun,
            prompt: args.prompt !== undefined ? args.prompt : baseRun.prompt,
            command: args.command !== undefined ? args.command : baseRun.command,
            arguments: args.arguments !== undefined ? args.arguments : baseRun.arguments,
            files: args.files !== undefined ? parseFiles(args.files) : baseRun.files,
            agent: args.agent !== undefined ? args.agent : baseRun.agent,
            model: args.model !== undefined ? args.model : baseRun.model,
            variant: args.variant !== undefined ? args.variant : baseRun.variant,
            title: args.title !== undefined ? args.title : baseRun.title,
            share: args.share !== undefined ? args.share : baseRun.share,
            continue: args.continue !== undefined ? args.continue : baseRun.continue,
            session: args.session !== undefined ? args.session : baseRun.session,
            runFormat: args.runFormat !== undefined ? parseRunFormatInput(args.runFormat) : baseRun.runFormat,
            port: args.port !== undefined ? args.port : baseRun.port,
            attachUrl: args.attachUrl !== undefined ? args.attachUrl : baseRun.attachUrl,
          }

          let runOverride: JobRunSpec
          try {
            runOverride = normalizeRunSpec(overrideCandidate)
            validateRunSpec(runOverride)
          } catch (error) {
            const msg = error instanceof Error ? error.message : String(error)
            return errorResult(format, `Invalid run override: ${msg}`)
          }

          const runJob: Job = {
            ...job,
            run: runOverride,
          }

          let runResult
          try {
            runResult = runJobNow(runJob)
          } catch (error) {
            const msg = error instanceof Error ? error.message : String(error)
            return errorResult(format, `Failed to start job "${job.name}": ${msg}`)
          }

          const logs = getJobLogs(runJob)
          const attachHint = runOverride.attachUrl ? `\nAttach: opencode attach ${runOverride.attachUrl}` : ""
          const logSection = logs ? `\nLatest logs:\n${logs}` : "\nNo logs yet. Check again soon."

          return okResult(
            format,
            `Triggered "${job.name}" (fire-and-forget).\nLogs: ${runResult.logPath}${attachHint}${logSection}`,
            {
              job: runResult.job ?? job,
              startedAt: runResult.startedAt,
              logPath: runResult.logPath,
              pid: runResult.pid,
            }
          )
        },
      }),

      job_logs: tool({
        description: [
          "Show the most recent stdout/stderr from a scheduled job's log file (last N lines, default tail).",
          "Trigger phrases: 'show logs for X', 'did X run', 'why did X fail', 'debug job', 'what",
          "happened with X', 'tail the scheduler log', 'check job output', 'last run output'.",
          "Read-only. Use after run_job to inspect the immediate result, or when get_job shows",
          "lastRunStatus=failed to find the cause. Returns raw supervised process output.",
        ].join(" "),
        args: {
          name: tool.schema.string().describe("The job name or slug"),
          lines: tool.schema
            .number()
            .optional()
            .describe("Number of lines from the end of the log (default 200)."),
          format: tool.schema.string().optional().describe("Optional: output format ('text' or 'json')."),
        },
        async execute(args) {
          const format = normalizeFormat(args.format)
          const job = findJobByName(args.name)

          if (!job) {
            return errorResult(format, `Job "${args.name}" not found.`)
          }

          const tailLines = typeof args.lines === "number" && Number.isFinite(args.lines) ? args.lines : 200
          const logs = getJobLogs(job, { tailLines, maxChars: 20000 })
          const logPath = getLogPath(job)

          if (!logs) {
            return okResult(format, `No logs found for "${job.name}". The job may not have run yet.`, {
              job,
              logPath,
              logs: "",
            })
          }

          return okResult(format, `Logs for ${job.name}\n\n${logs}`, { job, logPath, logs })
        },
      }),
    },
  }
}

// Default export for OpenCode plugin system
export default SchedulerPlugin
