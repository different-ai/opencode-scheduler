# opencode-scheduler

Run AI agents on a schedule. Set up recurring tasks that execute autonomously—even when you're away.

```
Schedule a daily job at 9am to search Facebook Marketplace for posters under $100 and send the top 5 deals to my Telegram
```

This is an [OpenCode](https://opencode.ai) plugin that uses your OS's native scheduler (launchd on Mac, systemd on Linux) to run prompts reliably—survives reboots, catches up on missed runs.

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
| Run immediately | `Run the standing-desk job now` |
| View logs | `Show logs for standing-desk` |
| Delete | `Delete the standing-desk job` |

## How It Works

1. You describe what you want scheduled in natural language
2. The plugin creates a cron job and installs it in your OS scheduler
3. At the scheduled time, OpenCode runs your prompt autonomously
4. Output is logged to `~/.config/opencode/logs/`

Jobs run from the working directory where you created them, picking up your `opencode.json` and MCP configurations.

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
| `delete_job` | Remove a scheduled job |
| `run_job` | Execute a job immediately |
| `job_logs` | View logs from a job |

### Storage

| What | Where |
|------|-------|
| Job configs | `~/.config/opencode/jobs/*.json` |
| Logs | `~/.config/opencode/logs/*.log` |
| launchd plists (Mac) | `~/Library/LaunchAgents/com.opencode.job.*.plist` |
| systemd units (Linux) | `~/.config/systemd/user/opencode-job-*.{service,timer}` |

### Working Directory

Jobs run from a specific directory to pick up MCP configs:

```
Schedule a daily job at 9am from /path/to/project to run my-task
```

By default, jobs use the directory where you created them.

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
