# opencode-scheduler

Run AI agents on a schedule. Set up recurring tasks that execute autonomously—even when you're away.

```
Schedule a daily job at 9am to search Facebook Marketplace for posters under $100 and send the top 5 deals to my Telegram
```

This is an [OpenCode](https://opencode.ai) plugin that uses your OS's native scheduler (launchd on Mac, systemd on Linux) to run prompts reliably—survives reboots, catches up on missed runs.

As of `v1.2.0`, jobs are scoped by `workdir` (so different projects don't collide), and scheduled runs are supervised (no overlap + optional timeout).

## Install

Add to your `opencode.json`:

```json
{
  "plugin": ["opencode-scheduler"]
}
```

## Examples

**Daily deal hunting:**
```
Schedule a daily job at 9am to search for standing desks under $300
```

**Weekly reports:**
```
Schedule a job every Monday at 8am to summarize my GitHub notifications
```

**Recurring reminders:**
```
Schedule a job every 6 hours to check if my website is up and alert me on Slack if it's down
```

## Commands

| Command | Example |
|---------|---------|
| Schedule a job | `Schedule a daily job at 9am to...` |
| List jobs | `Show my scheduled jobs` |
| Get version | `Show scheduler version` |
| Install skill template | `Install the scheduled job best practices skill` |
| Get job | `Show details for standing-desk` |
| Update job | `Update standing-desk to run at 10am` |
| Run immediately | `Run the standing-desk job now` |
| View logs | `Show logs for standing-desk` |
| Delete | `Delete the standing-desk job` |

## How It Works

1. You describe what you want scheduled in natural language
2. The plugin writes a job file (scoped by `workdir`) and installs a timer in your OS scheduler
3. At the scheduled time, the OS scheduler calls a small supervisor script
4. The supervisor runs the job, appends logs, and updates job metadata

You can also trigger a job immediately via `run_job`—it runs fire-and-forget and appends to the same log file.

Jobs run from the working directory where you created them, picking up your `opencode.json` and MCP configurations.

### Reliability Guarantees (Scheduled Runs)

- **No overlap**: if the previous run is still active, the next scheduled tick is skipped.
- **Non-interactive by default**: scheduled runs force `OPENCODE_PERMISSION` to deny "question" prompts, so jobs don't hang waiting for approvals.
- **Optional timeout**: set `timeoutSeconds` to hard-stop long runs (SIGTERM, then SIGKILL).

---

## Reference

### Cron Syntax

Jobs use standard 5-field cron expressions:

```
┌───────────── minute (0-59)
│ ┌───────────── hour (0-23)
│ │ ┌───────────── day of month (1-31)
│ │ │ ┌───────────── month (1-12)
│ │ │ │ ┌───────────── day of week (0-6, Sunday=0)
│ │ │ │ │
* * * * *
```

| Expression | Meaning |
|------------|---------|
| `0 9 * * *` | Daily at 9:00 AM |
| `0 */6 * * *` | Every 6 hours |
| `30 8 * * 1` | Mondays at 8:30 AM |
| `0 9,17 * * *` | At 9 AM and 5 PM daily |

### Tools

| Tool | Description |
|------|-------------|
| `schedule_job` | Create a new scheduled job |
| `list_jobs` | List all scheduled jobs |
| `get_version` | Show scheduler and opencode versions |
| `get_skill` | Get built-in skill templates (best practices) |
| `install_skill` | Install a built-in skill into your repo |
| `get_job` | Fetch job details and metadata |
| `update_job` | Update an existing job |
| `delete_job` | Remove a scheduled job |
| `run_job` | Execute a job immediately (fire-and-forget) |
| `job_logs` | View the latest logs from a job |

`schedule_job` and `update_job` accept an optional `timeoutSeconds` (integer seconds). Use `0` (or omit) to disable.

Tools accept an optional `format: "json"` argument to return structured output with `success`, `output`, `shouldContinue`, and `data`.

### Storage

| What | Where |
|------|-------|
| Job configs (scoped) | `~/.config/opencode/scheduler/scopes/<scopeId>/jobs/*.json` |
| Run records (scoped) | `~/.config/opencode/scheduler/scopes/<scopeId>/runs/*.jsonl` |
| Locks (scoped) | `~/.config/opencode/scheduler/scopes/<scopeId>/locks/*.json` |
| Logs (scoped) | `~/.config/opencode/logs/scheduler/<scopeId>/*.log` |
| Supervisor script | `~/.config/opencode/scheduler/supervisor.pl` |
| launchd plists (Mac) | `~/Library/LaunchAgents/com.opencode.job.<scopeId>.*.plist` |
| systemd units (Linux) | `~/.config/systemd/user/opencode-job-<scopeId>-*.{service,timer}` |

Legacy note: older versions stored jobs in `~/.config/opencode/jobs/*.json` and used unscoped unit names. `delete_job` removes both scoped and legacy artifacts.

### Working Directory

Jobs run from a specific directory to pick up MCP configs:

```
Schedule a daily job at 9am from /path/to/project to run my-task
```

By default, jobs use the directory where you created them.

### Scopes

Scopes are derived from the job's `workdir` (normalized absolute path). This isolates job storage, logs, and OS scheduler unit names per project.

- `list_jobs` defaults to the **current scope** (your current working directory).
- Use `allScopes: true` to list jobs across all scopes.
- Use `includeLegacy: true` to include pre-`v1.2.0` jobs stored in `~/.config/opencode/jobs`.

### Attach URL (optional)

If you have an OpenCode backend running via `opencode serve` or `opencode web`, you can set `attachUrl` on a job so runs use that backend:

```
Update the standing-desk job to use attachUrl http://localhost:4096
```

## Project Philosophy

- This plugin is intentionally a thin wrapper: it schedules `opencode run` via launchd (Mac) or systemd (Linux).
- Logs are the source of truth for scheduled runs: `~/.config/opencode/logs/*.log`.
- Resiliency/reporting roadmap (not implemented): `PRD-resilient-execution.md`.

### Built-in Skill Templates

To install the built-in skill into your project (no copy/paste), open OpenCode in your repo and run:

```
Install the scheduled job best practices skill
```

This calls the plugin’s `install_skill` tool and writes `.opencode/skill/scheduled-job-best-practices/SKILL.md`.

(If you prefer, you can also say: `Get skill from opencode-scheduler and add it to my skills`.)

Then add `@scheduled-job-best-practices` at the top of scheduled job prompts.

(Manual option: use `get_skill` to fetch `scheduled-job-best-practices` and copy it into `.opencode/skill/scheduled-job-best-practices/SKILL.md`.)

## Troubleshooting

**Jobs not running?**

1. Check if installed:
   - Mac: `launchctl list | grep opencode`
   - Linux: `systemctl --user list-timers | grep opencode`

2. Check logs: `Show logs for my-job`

3. Verify the working directory has the right `opencode.json` with MCP configs

**MCP tools not available?**

Make sure the job's working directory contains an `opencode.json` with your MCP server configurations.

## License

MIT
