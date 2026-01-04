/**
 * OpenCode Scheduler Plugin
 *
 * Schedule recurring jobs using launchd (Mac) or systemd (Linux).
 * Jobs are stored in ~/.config/opencode/jobs/
 *
 * Features:
 * - Survives reboots
 * - Catches up on missed runs (if computer was asleep)
 * - Cross-platform (Mac + Linux)
 * - Working directory support for MCP configs
 * - Environment variable injection (PATH for node/npx)
 */
import type { Plugin } from "@opencode-ai/plugin";
export declare const SchedulerPlugin: Plugin;
export default SchedulerPlugin;
