#!/usr/bin/env node
/**
 * opencode-scheduler supervisor for Windows
 *
 * Node.js port of the Perl supervisor (supervisor.pl) used on Mac/Linux.
 * Task Scheduler runs this script instead of opencode directly, enabling:
 * - No-overlap (lock file + PID check)
 * - Timeout enforcement (setTimeout + taskkill)
 * - Non-interactive guarantee (OPENCODE_PERMISSION)
 * - Run history (JSONL append)
 * - Job metadata updates (lastRunStatus, etc.)
 *
 * Usage: node supervisor.js <job.json>
 */
export {};
