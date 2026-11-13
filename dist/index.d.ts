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
export declare const SchedulerPlugin: Plugin;
declare const entry: {
    id: string;
    server: Plugin;
    setup(context: any): Promise<void>;
};
export default entry;
