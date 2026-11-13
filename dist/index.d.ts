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
type ToolCall2 = {
    sessionID: string;
    messageID: string;
    agent: string;
    signal: AbortSignal;
};
type Tool2 = {
    name: string;
    description: string;
    input: unknown;
    options: {
        codemode: boolean;
    };
    execute(input: unknown, call: ToolCall2): Promise<{
        content: string;
    }>;
};
type PluginContext2 = {
    location: {
        directory: string;
    };
    session: {
        get(input: {
            sessionID: string;
        }): Promise<{
            location?: {
                directory?: string;
            };
        }>;
    };
    tool: {
        transform(callback: (editor: {
            add(tool: Tool2): void;
        }) => void): Promise<unknown>;
    };
};
declare function setup(ctx: Partial<PluginContext2>): Promise<void>;
declare const _default: {
    id: string;
    server: Plugin;
    setup: typeof setup;
};
export default _default;
