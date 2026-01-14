# PRD: Resilient Job Execution & Reporting (opencode-scheduler)

## Summary

Today, `opencode-scheduler` is intentionally thin: it schedules your prompt by having the OS run `opencode run -- "<prompt>"` at a cron time. This works well, but it creates two common pain points:

1. **Observability gap**: scheduled runs append to `~/.config/opencode/logs/<job>.log`, but they don’t reliably update job metadata ("last run", exit code, etc.) because the OS is running `opencode` directly.
2. **Resilience gap**: transient failures (browser extension offline, network blips, etc.) can cause a full miss, and permanent failures (interactive logins, missing modules) can spam logs without a clear “this needs human attention” signal.

This PRD proposes an *optional* “supervisor” wrapper and a first-pass timeout/retry policy that improve reliability and reporting **without changing the core mental model**: *the scheduler still just runs `opencode run`*.

## Goals

- Keep the scheduler as a lightweight OS-level runner.
- Make job status understandable at a glance (last run time, source, exit code, failure reason).
- Improve outcomes for transient failures via optional retry.
- Avoid prompt “injection” as a product feature; prompts should compute runtime values by calling tools.
- Provide primitives for future improvements (run history, failure notifications) without creating a workflow engine.

## Non-goals

- No distributed scheduler, queue, or server-side orchestration.
- No interactive UI requirements.
- No resource locking/serialization in v1 (e.g., browser lock management).
- No prompt rewriting or templating/injection system.

## Current Behavior (baseline)

- Jobs are stored in `~/.config/opencode/jobs/<slug>.json`.
- Logs are written to `~/.config/opencode/logs/<slug>.log`.
- On macOS, launchd executes `opencode run -- "<prompt>"` with a WorkingDirectory and PATH.
- On Linux, systemd executes the same as a oneshot service.

**Important nuance:** `lastRunAt/lastRunStatus/lastRunExitCode` are best-effort today and may not reflect scheduled runs.

## Proposal

### 1) Supervisor Wrapper (optional)

Instead of having launchd/systemd run `opencode` directly, the scheduler can generate/run a tiny supervisor that:

- records a run start marker (timestamp, run id)
- executes `opencode run ...` unchanged
- captures exit code and duration
- records a run end marker
- updates job metadata and a run-history file

This preserves the mental model (still `opencode run`) but adds a consistent “envelope” around it.

#### Supervisor responsibilities

- **Run bookkeeping**
  - `runId`: UUID or timestamp-based id
  - `startedAt`, `finishedAt`, `durationMs`
  - `source`: `scheduled | manual`
  - `status`: `running | success | failed | timeout`
  - `exitCode`
  - `errorSummary`: short human-readable failure reason (best-effort)

- **Job metadata update** (atomic write)
  - Update `~/.config/opencode/jobs/<slug>.json` with the latest run fields for scheduled runs.
  - Use atomic write semantics (write temp + rename) to avoid partial writes.

- **Run history**
  - Append a JSON line record to `~/.config/opencode/runs/<slug>.jsonl`.
  - Keep the existing `.log` file as the canonical raw output.

- **No prompt modification**
  - The supervisor must not inject data into the prompt.

#### Design details

- **How launchd/systemd invokes it**
  - macOS: launchd `ProgramArguments` runs `opencode-scheduler supervise --job <slug>` (or equivalent).
  - Linux: systemd `ExecStart` runs the same.

- **Where errors come from**
  - Some failures happen before the prompt runs (opencode crashes, auth/runtime errors). These are still valuable and should be surfaced.

- **Backwards compatibility**
  - Jobs scheduled before this change keep working.
  - The scheduler can offer an opt-in migration path per job.

### 2) Timeout Policy (optional)

Add a per-job timeout to cap runaway runs (browser hangs, stuck auth, etc.).

- `timeoutSeconds`: number
- Default: unset (no timeout)

Supervisor behavior:

- If the child process exceeds `timeoutSeconds`, terminate it (best-effort), mark status `timeout`, and write an error summary.
- Always write the “run end” marker even on timeout.

### 3) Retry Policy (optional)

Retry is useful only for failures likely to resolve quickly (transient). It should be conservative and bounded.

Per-job config:

- `retries`: number (default 0)
- `retryBackoffSeconds`: number (default 30)
- `retryMaxBackoffSeconds`: number (default 300)
- `retryOn`: one of:
  - `never`
  - `always` (not recommended)
  - `transient` (recommended)

#### Transient vs permanent classification

“Transient” should be defined by a small set of conservative matchers on stderr/log tail (configurable later). Examples:

- Transient (retry OK):
  - browser/native host temporarily offline
  - network timeout / DNS failure
  - rate limiting

- Permanent (do not retry):
  - interactive login required (QR code)
  - missing module / missing dependency
  - prompt logic errors that will reproduce deterministically

#### Retry loop constraints

- Cap total attempts to `1 + retries`.
- Cap total time spent including backoff (e.g., do not exceed `timeoutSeconds` * attempts or a global ceiling).
- On first successful attempt, stop retrying and mark run success.

## UX / Product Surface

### Job definition

This PRD assumes optional fields could be added to the job JSON over time:

- `timeoutSeconds`
- `retries`
- `retryOn`
- `retryBackoffSeconds`

These are not required for v1; they can be added later as optional enhancements.

### Failure notifications (future)

Optionally, the supervisor could send a single failure notification via a non-interactive channel (Telegram bot API, Slack webhook, etc.). This remains a future enhancement because it requires credential handling.

## Security & Privacy

- Never include secrets in logs by default.
- Supervisor should not print environment variables.
- Keep all durable records in the user’s home directory under the existing opencode config root.

## Success Metrics

- Scheduled runs reliably show:
  - last run time
  - status
  - exit code
  - short failure reason
- Reduced “silent miss” rate for transient issues due to bounded retries.

## Open Questions

- Should run history live under `~/.config/opencode/` (consistent) or alongside logs?
- What’s the minimal, safe set of transient error matchers across platforms?
- Do we want a single supervisor for both manual and scheduled runs, or keep manual `run_job` as-is?
