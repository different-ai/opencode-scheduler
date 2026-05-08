# Scheduling — agent-facing guidance

This document is for agents (Claude / opencode / etc.) calling
`schedule_job`. Humans reading the README only need the
[Session policies](../README.md#session-policies) table; this file
is the playbook for how an agent should phrase the question to the
user, and what the runner does at fire-time so the agent knows what
to surface in the success message.

## sessionPolicy is REQUIRED — always elicit, never default

`sessionPolicy` has **no default** on `schedule_job`. The plugin
will reject a call without it. This is intentional: a silent default
('current' in the original design) caused the "Status: success but
my TUI never refreshed" reproduction — the headless run wrote into
the user's TUI session via shared SQLite, but live events fired in
the dead supervisor process and the open TUI never refreshed.

**Always ask the user which policy they want, unless they already
named one or unambiguously implied one.** Use the inference table
below to translate vague phrasing into a concrete *suggestion* you
present to the user — not as a silent decision.

## Inference table — what to suggest when the user is vague

| User says (paraphrased) | Suggest |
|--|--|
| "Schedule X every day" / "Set up a daily job" / "Run X tomorrow morning" | `current` (with the warning below if their TUI is in-process-only) |
| "Independent job" / "Separate chat" / "Don't mess up this thread" / "независимая джоба" | `new-per-job` |
| "New session each run" / "Fresh chat every time" / "Каждый запуск отдельно" | `new-per-run` |
| "Use my session abc-123" / explicit session id given | `existing` (require `sessionId`) |
| "Run on the server at http://X:4096" / explicit attachUrl | keep the discussed `sessionPolicy`; add `attachUrl` |

If the user gives a one-word "schedule X" with no other cues, ASK:
something like *"Should this run continue this chat (`current`),
spawn one fresh long-running thread (`new-per-job`), or start a
brand-new session every time it fires (`new-per-run`)?"*. Don't
guess.

### sessionId precedence with `current`

If both `sessionPolicy='current'` and an explicit `sessionId` are
passed, the explicit `sessionId` wins over `toolCtx.sessionID`.
This is intentional: it lets an agent call `schedule_job` on behalf
of a session it isn't currently inside (e.g. "schedule into the
chat I had open ten minutes ago", or scripted bulk-scheduling). When
you have no override, `current` resolves from the calling session.

If you want strict "always the current chat, ignore any sessionId
arg" behavior, prefer leaving `sessionId` undefined.

## Three host-opencode hosting modes

The plugin supports three ways the host opencode can be running.
Each gives a different live-delivery surface:

| Mode | host launch | `serverUrl` plugin gets | F5 entry | live-delivery path |
|---|---|---|---|---|
| **1** | `opencode` (TUI) without `--port` | `http://opencode.internal/...` (in-process IPC sentinel) | NOT written (sentinel filtered out) | F2a warning surfaces; runner falls back to headless |
| **2** | `opencode serve --port N` (or `--port 0`) | `http://127.0.0.1:N/...` | written on plugin init | F2b auto-promotes `serverUrl` → `attachUrl` |
| **3** | `server.port: 0` in `~/.config/opencode/opencode.json` | same as Mode 2 — OS-assigned TCP port on every start | same as Mode 2 | same as Mode 2; no CLI flag needed |

**Compatibility (verified 2026-05-03 against `opencode-ai@1.14.33` npm binary AND fork `0.0.0-custom-202605031808`):**

- **Modes 1 + 2 — work identically on upstream npm.** The npm
  binary already contains the `opencode.internal` sentinel and the
  `--port [default: 0]` CLI flag, so the plugin's behaviour does
  not depend on a fork. Verified by spawning
  `/Users/com/.nvm/.../opencode-ai/bin/opencode serve --port 5050`
  → F5 entry `63477.json` was written on first `/app` request,
  plugin loaded normally.
- **Mode 3 requires F7** (`Server.port` `.positive()` →
  `.nonnegative()` in `packages/opencode/src/config/config.ts`).
  Without it the upstream config parser rejects `port: 0` with
  `ConfigInvalidError` and the plugin never loads. Verified — same
  npm binary, same plugin, but with workdir `opencode.json`
  containing `{"server":{"port":0}}`: every `/app` request returned
  HTTP 500 `error=ConfigInvalidError failed`, no F5 entry was ever
  written. Fork with the F7 patch accepts the same config and
  Mode 3 works end-to-end.

Until F7 lands upstream, the recommended path on stock npm
opencode is **Mode 2** (just add `--port 0` to the launcher /
shell alias). `install_server_config` tool prepares Mode 3 but is
only useful once the host opencode binary accepts `port: 0` at
schema-validation time.

## Live delivery — what the agent should know

When a job fires, the runner picks `attachUrl` in this order:

1. **Explicit `attachUrl` on the job** (passed at `schedule_job`
   time, or auto-detected from the host opencode's `serverUrl` when
   it was launched with `--port` — the F2b auto-promote).
2. **F5 plugin-side runtime registry**: every opencode that loads
   this plugin and is reachable externally publishes
   `~/.local/share/opencode/runtime/<pid>.json`. The runner reads
   the directory at fire-time, filters by `kill(pid, 0)` and
   `GET /session/<sid>` == 200, sorts by `startedAt` desc with
   workdir affinity, and uses the best candidate's URL.
3. **No candidate** → headless `opencode run` fallback (exit 10
   from the runner, supervisor takes over).

The JSONL run record at
`~/.config/opencode/scheduler/scopes/<scope>/runs/<slug>.jsonl`
includes `attachUrlSource: 'job' | 'registry'` so post-mortems can
distinguish "user-configured target" from "auto-found neighbour".

### F2a warning the agent MUST surface

When the host opencode is running without `--port`, its `serverUrl`
is `http://opencode.internal/...` (in-process IPC sentinel,
unreachable from the supervisor). In that mode, scheduled runs
deliver via headless opencode — messages land in storage
immediately, but the open TUI does NOT refresh until the user
re-opens the session. `schedule_job` returns a warning block in its
success output for this case (only when `sessionPolicy` routes to
the calling TUI: `current` / `existing`).

If the user wants live delivery into the open TUI, two paths:

- **One-off**: restart opencode with `--port 0` (OS-assigned random
  port) or `--port N`, then re-create the job. The plugin
  auto-detects the new `serverUrl` and the F2b auto-promote attaches
  to it.
- **Permanent**: run `install_server_config` (the F6 tool — see
  README) to write `server.port: 0` into
  `~/.config/opencode/opencode.json`. Every future opencode start
  will pick a TCP port and register itself with the F5 registry, so
  no per-launcher `--port` flag is needed. Requires the F7 upstream
  Zod fix to accept `port: 0`; on a pre-F7 opencode pass an
  explicit positive port.

## Permission caveat

The scheduler **does not** mutate an existing session's permission
ruleset (`current` / `existing`) — there is no public route to do
so. Only sessions created by the scheduler itself (`new-per-job`,
`new-per-run`) are guaranteed to have `question` / `plan_enter` /
`plan_exit` denied. Headless fallback still gets
`OPENCODE_PERMISSION={"question":"deny"}` via supervisor env, so
even into a question-asking session the headless path won't block.

If a user explicitly says "no questions, no prompts" and they want
strict guarantees, suggest `new-per-job` rather than `current`.

## When to ask the user vs. just confirm and proceed

`sessionPolicy` choice itself ALWAYS goes through the user (it's
required). For the orthogonal axes:

- **Destructive prompts** (job that deletes branches, files, DB
  rows…) — name the policy choice in your confirmation: "I'll
  schedule this as `new-per-job` so it doesn't write into our
  current chat — confirm?"
- **Ambiguous policy** — present 2 options with one-line
  consequences, e.g. *"`current` → reminder lands in this chat;
  `new-per-job` → reminder lands in a dedicated session you can
  open separately. Which?"*

For executionPolicy / deliveryPolicy: leave at defaults
(`prefer-live-server` / `execute`) unless the user explicitly says
otherwise.

## Execution + delivery axes

These are orthogonal to session policy and almost always
default-fine:

- **executionPolicy** — leave at `prefer-live-server` unless the
  user says "always run as a separate process" / "no shared
  server". `headless-only` skips F5 discovery entirely (the user
  opted out of live delivery on purpose).
- **deliveryPolicy** — leave at `execute` unless the user says
  "queue the message" / "don't wait" / "leave it in the chat for
  me". `leave-message` posts with `noReply: true` so the message
  lands in the session for the user/agent to pick up later.

## Examples

```
User: "schedule a daily 9am job to summarize my GitHub notifs"
  Agent: "Should this run continue this chat (`current`) or spawn
          a dedicated background session (`new-per-job`)?"
  User: "current"
  → sessionPolicy='current'  executionPolicy='prefer-live-server'  deliveryPolicy='execute'

User: "set up a separate background job to run every 6 hours"
  → sessionPolicy='new-per-job'  (rest defaults; "separate" is
    unambiguous)

User: "every fire should be a fresh session, don't share state"
  → sessionPolicy='new-per-run'  (rest defaults; "fresh session
    each fire" is unambiguous)

User: "leave a status report message in my chat every morning,
       I'll read it when I get in"
  → sessionPolicy='current'  deliveryPolicy='leave-message'
    (and surface the F2a warning if the host opencode is in-process
    only — the user thinks the chat will refresh, it won't)

User: "schedule on the server at http://192.168.1.42:4096"
  Agent: "...into a fresh session on that server (`new-per-job`)
          or into a specific existing session there (`existing`)?"
  User: "new-per-job"
  → sessionPolicy='new-per-job'  attachUrl='http://192.168.1.42:4096'
```
