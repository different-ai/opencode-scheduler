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
import type { Plugin } from "@opencode-ai/plugin"
import { tool } from "@opencode-ai/plugin"
import { createWriteStream, existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, unlinkSync } from "fs"
import { dirname, join } from "path"
import { homedir, platform } from "os"
import { execFileSync, execSync, spawn, type ChildProcess } from "child_process"
import { fileURLToPath } from "url"

// Storage location - shared with other opencode tools
const OPENCODE_CONFIG = join(homedir(), ".config", "opencode")
const JOBS_DIR = join(OPENCODE_CONFIG, "jobs")
const LOGS_DIR = join(OPENCODE_CONFIG, "logs")

// Platform detection
const IS_MAC = platform() === "darwin"
const IS_LINUX = platform() === "linux"

// launchd paths (Mac)
const LAUNCH_AGENTS_DIR = join(homedir(), "Library", "LaunchAgents")
const LAUNCHD_PREFIX = "com.opencode.job"

// systemd paths (Linux)
const SYSTEMD_USER_DIR = join(homedir(), ".config", "systemd", "user")

// Ensure directory exists
function ensureDir(dir: string) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}

// Slugify a name
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

// Job type

type OpencodeRunFormat = "default" | "json"

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

interface Job {
  slug: string
  name: string
  schedule: string

  // Legacy fields (kept for backward compatibility)
  prompt?: string
  attachUrl?: string

  // Preferred run specification (maps to `opencode run` flags)
  run?: JobRunSpec

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
  const paths = [
    join(homedir(), ".opencode", "bin", "opencode"),
    "/usr/local/bin/opencode",
    "/opt/homebrew/bin/opencode",
  ]

  for (const p of paths) {
    if (existsSync(p)) {
      return p
    }
  }

  return "opencode" // hope it's in PATH
}

// Get PATH that includes common locations for node/npx
function getEnhancedPath(): string {
  const paths = [
    "/opt/homebrew/bin",
    "/usr/local/bin",
    "/usr/bin",
    "/bin",
    "/usr/sbin",
    "/sbin",
  ]
  return paths.join(":")
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

// === LAUNCHD (Mac) ===

function createLaunchdPlist(job: Job): string {
  const label = `${LAUNCHD_PREFIX}.${job.slug}`
  const logPath = join(LOGS_DIR, `${job.slug}.log`)

  const calendars = cronToLaunchdCalendars(job.schedule)
  const calendarXml =
    calendars.length === 1
      ? `  <dict>\n${renderLaunchdCalendar(calendars[0])}\n  </dict>`
      : `  <array>\n${calendars
          .map((calendar) => `  <dict>\n${renderLaunchdCalendar(calendar)}\n  </dict>`)
          .join("\n")}\n  </array>`

  const invocation = buildOpencodeArgs(job)
  const programArguments = invocation.args
    .map((arg) => `    <string>${escapePlistString(arg)}</string>`)
    .join("\n")

  const programArgumentsXml = [
    `    <string>${escapePlistString(invocation.command)}</string>`,
    programArguments,
  ].join("\n")

  // Use workdir if specified, otherwise default to home directory
  const workdir = job.workdir || homedir()
  const enhancedPath = getEnhancedPath()

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
    <key>PATH</key>
    <string>${enhancedPath}</string>
  </dict>
  
  <key>ProgramArguments</key>
  <array>
${programArgumentsXml}
  </array>
  
  <key>StartCalendarInterval</key>
${calendarXml}
  
  <key>StandardOutPath</key>
  <string>${logPath}</string>
  
  <key>StandardErrorPath</key>
  <string>${logPath}</string>
  
  <key>RunAtLoad</key>
  <false/>
</dict>
</plist>`
}


function installLaunchdJob(job: Job): void {
  ensureDir(LAUNCH_AGENTS_DIR)
  ensureDir(LOGS_DIR)

  const label = `${LAUNCHD_PREFIX}.${job.slug}`
  const plistPath = join(LAUNCH_AGENTS_DIR, `${label}.plist`)

  // Unload if exists
  try {
    execSync(`launchctl unload "${plistPath}" 2>/dev/null`, { stdio: "ignore" })
  } catch {}

  // Write plist
  const plist = createLaunchdPlist(job)
  writeFileSync(plistPath, plist)

  // Load
  execSync(`launchctl load "${plistPath}"`)
}

function uninstallLaunchdJob(slug: string): void {
  const label = `${LAUNCHD_PREFIX}.${slug}`
  const plistPath = join(LAUNCH_AGENTS_DIR, `${label}.plist`)

  if (existsSync(plistPath)) {
    try {
      execSync(`launchctl unload "${plistPath}"`, { stdio: "ignore" })
    } catch {}
    unlinkSync(plistPath)
  }
}

// === SYSTEMD (Linux) ===

function createSystemdService(job: Job): string {
  const logPath = join(LOGS_DIR, `${job.slug}.log`)
  const workdir = job.workdir || homedir()
  const enhancedPath = getEnhancedPath()

  const invocation = buildOpencodeArgs(job)
  const escapedArgs = invocation.args.map((arg) => `"${escapeSystemdArg(arg)}"`).join(" ")

  return `[Unit]
Description=OpenCode Job: ${job.name}

[Service]
Type=oneshot
WorkingDirectory=${workdir}
Environment="PATH=${enhancedPath}"
ExecStart=${invocation.command} ${escapedArgs}
StandardOutput=append:${logPath}
StandardError=append:${logPath}

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

  const servicePath = join(SYSTEMD_USER_DIR, `opencode-job-${job.slug}.service`)
  const timerPath = join(SYSTEMD_USER_DIR, `opencode-job-${job.slug}.timer`)

  // Write service and timer
  writeFileSync(servicePath, createSystemdService(job))
  writeFileSync(timerPath, createSystemdTimer(job))

  // Reload and enable
  execSync("systemctl --user daemon-reload")
  execSync(`systemctl --user enable opencode-job-${job.slug}.timer`)
  execSync(`systemctl --user start opencode-job-${job.slug}.timer`)
}

function uninstallSystemdJob(slug: string): void {
  try {
    execSync(`systemctl --user stop opencode-job-${slug}.timer`, { stdio: "ignore" })
    execSync(`systemctl --user disable opencode-job-${slug}.timer`, { stdio: "ignore" })
  } catch {}

  const servicePath = join(SYSTEMD_USER_DIR, `opencode-job-${slug}.service`)
  const timerPath = join(SYSTEMD_USER_DIR, `opencode-job-${slug}.timer`)

  if (existsSync(servicePath)) unlinkSync(servicePath)
  if (existsSync(timerPath)) unlinkSync(timerPath)

  try {
    execSync("systemctl --user daemon-reload", { stdio: "ignore" })
  } catch {}
}

// === CROSS-PLATFORM ===

function installJob(job: Job): void {
  if (IS_MAC) {
    installLaunchdJob(job)
  } else if (IS_LINUX) {
    installSystemdJob(job)
  } else {
    throw new Error(`Unsupported platform: ${platform()}. Only macOS and Linux are supported.`)
  }
}

function uninstallJob(slug: string): void {
  if (IS_MAC) {
    uninstallLaunchdJob(slug)
  } else if (IS_LINUX) {
    uninstallSystemdJob(slug)
  }
}

// === JOB STORAGE ===

function loadJob(slug: string): Job | null {
  ensureDir(JOBS_DIR)
  const path = join(JOBS_DIR, `${slug}.json`)
  if (!existsSync(path)) return null
  try {
    return normalizeJob(JSON.parse(readFileSync(path, "utf-8")))
  } catch {
    return null
  }
}

function loadAllJobs(): Job[] {
  ensureDir(JOBS_DIR)
  const files = readdirSync(JOBS_DIR).filter((f) => f.endsWith(".json"))
  return files
    .map((f) => {
      try {
        return normalizeJob(JSON.parse(readFileSync(join(JOBS_DIR, f), "utf-8")))
      } catch {
        return null
      }
    })
    .filter(Boolean) as Job[]
}

function saveJob(job: Job): void {
  ensureDir(JOBS_DIR)
  const path = join(JOBS_DIR, `${job.slug}.json`)
  writeFileSync(path, JSON.stringify(sanitizeJob(job), null, 2))
}

function deleteJobFile(slug: string): void {
  const path = join(JOBS_DIR, `${slug}.json`)
  if (existsSync(path)) {
    unlinkSync(path)
  }
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
    slug: raw.slug,
    name: raw.name,
    schedule: raw.schedule,
    source: typeof raw.source === "string" ? raw.source : undefined,
    workdir: typeof raw.workdir === "string" ? raw.workdir : undefined,
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

  return sanitizeJob(job)
}

function findJobByName(name: string): Job | null {
  const slug = slugify(name)
  let job = loadJob(slug) || loadJob(name)

  if (!job) {
    const allJobs = loadAllJobs()
    job =
      allJobs.find(
        (j) =>
          j.slug === name ||
          j.slug.endsWith(`-${slug}`) ||
          j.name.toLowerCase() === name.toLowerCase() ||
          j.name.toLowerCase().includes(name.toLowerCase())
      ) || null
  }

  return job
}

function updateJobRecord(slug: string, updates: Partial<Job>): Job | null {
  const job = loadJob(slug)
  if (!job) return null
  const updated: Job = {
    ...job,
    ...updates,
    updatedAt: new Date().toISOString(),
  }
  saveJob(updated)
  return updated
}

function getLogPath(slug: string): string {
  return join(LOGS_DIR, `${slug}.log`)
}

function buildOpencodeArgs(job: Job): { command: string; args: string[] } {
  const command = findOpencode()
  const run = normalizeRunSpec(getJobRun(job))
  validateRunSpec(run)

  const args = ["run"]

  if (run.attachUrl) {
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
  const enhancedPath = getEnhancedPath()
  const existingPath = process.env.PATH
  const combinedPath = existingPath ? `${enhancedPath}:${existingPath}` : enhancedPath

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

  return {
    ...process.env,
    PATH: combinedPath,
    OPENCODE_PERMISSION: JSON.stringify(mergedPolicy),
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
  const startedAt = new Date().toISOString()
  const logPath = getLogPath(job.slug)
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
    updateJobRecord(job.slug, {
      lastRunStatus: "failed",
      lastRunExitCode: undefined,
      lastRunError: message,
    })
    throw error
  }

  const runningJob = updateJobRecord(job.slug, {
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
    updateJobRecord(job.slug, {
      lastRunStatus: "failed",
      lastRunExitCode: undefined,
      lastRunError: error.message,
    })
  })

  child.on("close", (code) => {
    const exitCode = typeof code === "number" ? code : undefined
    logStream.write(`\n=== Run complete (${exitCode ?? "unknown"}) ${new Date().toISOString()} ===\n`)
    logStream.end()
    updateJobRecord(job.slug, {
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

function getJobLogs(slug: string, options?: { tailLines?: number; maxChars?: number }): string | null {
  const logPath = getLogPath(slug)
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

// === PLUGIN ===

export const SchedulerPlugin: Plugin = async () => {
  return {
    tool: {
       schedule_job: tool({
         description:
           "Schedule a recurring job to run an opencode prompt. Uses launchd (Mac) or systemd (Linux) for reliable scheduling that survives reboots and catches up on missed runs.",
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
           format: tool.schema.string().optional().describe("Optional: output format ('text' or 'json')."),
         },

         async execute(args) {
           const format = normalizeFormat(args.format)
           const slug = args.source ? `${args.source}-${slugify(args.name)}` : slugify(args.name)

           if (loadJob(slug)) {
             return errorResult(format, `Job "${slug}" already exists. Delete it first or use a different name.`)
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

           let attachUrl: string | undefined
           try {
             attachUrl = normalizeAttachUrl(args.attachUrl)
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

           // Use provided workdir, or fall back to current directory
           const workdir = args.workdir || process.cwd()

           const job: Job = {
             slug,
             name: args.name,
             schedule: args.schedule,
             run: normalizeRunSpec(run),
             // keep legacy fields as well for backwards-compat / readability
             prompt: args.prompt,
             source: args.source,
             workdir,
             attachUrl,
             createdAt: new Date().toISOString(),
           }


          try {
            saveJob(job)
            installJob(job)

            const platformName = IS_MAC ? "launchd" : IS_LINUX ? "systemd" : "unknown"
            const primaryLine = run.command
              ? `Command: ${run.command}${run.arguments ? ` ${run.arguments}` : ""}`
              : `Prompt: ${(run.prompt ?? "").slice(0, 100)}${(run.prompt ?? "").length > 100 ? "..." : ""}`

            const attachLine = run.attachUrl ? `Attach URL: ${run.attachUrl}
` : ""

            return okResult(
              format,
              `Scheduled "${args.name}"

Schedule: ${args.schedule} (${describeCron(args.schedule)})
Platform: ${platformName}
Working Directory: ${workdir}
${attachLine}${primaryLine}

The job will run at the scheduled time. If your computer was asleep, it will catch up when it wakes.

Commands:
- "run ${args.name} now" - run immediately
- "show my jobs" - list all
- "delete job ${args.name}" - remove`,
              { job }
            )

          } catch (error) {
            deleteJobFile(slug)
            const msg = error instanceof Error ? error.message : String(error)
            return errorResult(format, `Failed to schedule job: ${msg}`)
          }
        },
      }),

      list_jobs: tool({
        description: "List all scheduled jobs. Optionally filter by source app.",
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
          let jobs = loadAllJobs()

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
        description: "Show the scheduler plugin version and opencode binary info.",
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
        description: "Get built-in skill templates to copy into your project.",
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
        description: "Install a built-in skill into your repo's .opencode/skill directory.",
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

      get_job: tool({

        description: "Get details for a scheduled job",
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
        description: "Update a scheduled job",
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
            updates.workdir = args.workdir
          }

          if (args.attachUrl !== undefined) {
            try {
              updates.attachUrl = normalizeAttachUrl(args.attachUrl)
            } catch (error) {
              const msg = error instanceof Error ? error.message : String(error)
              return errorResult(format, msg)
            }
          }

          if (Object.keys(updates).length === 0) {
            return errorResult(format, "No updates provided.")
          }

          const updatedJob: Job = {
            ...job,
            ...updates,
            updatedAt: new Date().toISOString(),
          }

          try {
            saveJob(updatedJob)
            installJob(updatedJob)
            return okResult(format, `Updated job "${updatedJob.name}"`, { job: updatedJob })
          } catch (error) {
            const msg = error instanceof Error ? error.message : String(error)
            saveJob(job)
            try {
              installJob(job)
            } catch {}
            return errorResult(format, `Failed to update job: ${msg}`)
          }
        },
      }),

      delete_job: tool({
        description: "Delete a scheduled job",
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

          uninstallJob(job.slug)
          deleteJobFile(job.slug)

          return okResult(format, `Deleted job "${job.name}"`, { job })
        },
      }),

      run_job: tool({
        description: "Run a scheduled job immediately",
        args: {
          name: tool.schema.string().describe("The job name or slug"),
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

          const logs = getJobLogs(job.slug)
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
        description: "View the latest logs from a scheduled job",
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
          const logs = getJobLogs(job.slug, { tailLines, maxChars: 20000 })
          const logPath = getLogPath(job.slug)

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
