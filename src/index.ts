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
import { execSync, spawn, type ChildProcess } from "child_process"
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
interface Job {
  slug: string
  name: string
  schedule: string
  prompt: string
  source?: string
  workdir?: string
  attachUrl?: string
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
  const opencode = findOpencode()
  const label = `${LAUNCHD_PREFIX}.${job.slug}`
  const logPath = join(LOGS_DIR, `${job.slug}.log`)

  const calendars = cronToLaunchdCalendars(job.schedule)
  const calendarXml =
    calendars.length === 1
      ? `  <dict>\n${renderLaunchdCalendar(calendars[0])}\n  </dict>`
      : `  <array>\n${calendars
          .map((calendar) => `  <dict>\n${renderLaunchdCalendar(calendar)}\n  </dict>`)
          .join("\n")}\n  </array>`

  const programArguments = [
    `    <string>${escapePlistString(opencode)}</string>`,
    "    <string>run</string>",
    ...(job.attachUrl
      ? [
          "    <string>--attach</string>",
          `    <string>${escapePlistString(job.attachUrl)}</string>`,
        ]
      : []),
    "    <string>--</string>",
    `    <string>${escapePlistString(job.prompt)}</string>`,
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
${programArguments}
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
  const opencode = findOpencode()
  const logPath = join(LOGS_DIR, `${job.slug}.log`)
  const workdir = job.workdir || homedir()
  const enhancedPath = getEnhancedPath()
  const attachArgs = job.attachUrl ? ` --attach "${escapeSystemdArg(job.attachUrl)}"` : ""

  return `[Unit]
Description=OpenCode Job: ${job.name}

[Service]
Type=oneshot
WorkingDirectory=${workdir}
Environment="PATH=${enhancedPath}"
ExecStart=${opencode} run${attachArgs} -- "${escapeSystemdArg(job.prompt)}"
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
    return JSON.parse(readFileSync(path, "utf-8"))
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
        return JSON.parse(readFileSync(join(JOBS_DIR, f), "utf-8"))
      } catch {
        return null
      }
    })
    .filter(Boolean) as Job[]
}

function saveJob(job: Job): void {
  ensureDir(JOBS_DIR)
  const path = join(JOBS_DIR, `${job.slug}.json`)
  writeFileSync(path, JSON.stringify(job, null, 2))
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
  const args = ["run"]
  if (job.attachUrl) {
    args.push("--attach", job.attachUrl)
  }
  args.push("--", job.prompt)
  return { command, args }
}

function buildRunEnvironment(): NodeJS.ProcessEnv {
  const enhancedPath = getEnhancedPath()
  const existingPath = process.env.PATH
  const combinedPath = existingPath ? `${enhancedPath}:${existingPath}` : enhancedPath
  return {
    ...process.env,
    PATH: combinedPath,
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

  if (job.attachUrl) {
    lines.push(`Attach URL: ${job.attachUrl}`)
  }

  lines.push(`Prompt: ${job.prompt}`)
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

function getJobLogs(slug: string): string | null {
  const logPath = getLogPath(slug)
  if (!existsSync(logPath)) return null
  try {
    const content = readFileSync(logPath, "utf-8")
    return content.length > 5000 ? content.slice(-5000) : content
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
          prompt: tool.schema.string().describe("The prompt to run"),
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
            const attachLine = attachUrl ? `Attach URL: ${attachUrl}\n` : ""

            return okResult(
              format,
              `Scheduled "${args.name}"

Schedule: ${args.schedule} (${describeCron(args.schedule)})
Platform: ${platformName}
Working Directory: ${workdir}
${attachLine}Prompt: ${args.prompt.slice(0, 100)}${args.prompt.length > 100 ? "..." : ""}

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
          source: tool.schema.string().optional().describe("Filter by source app (e.g. 'marketplace')"),
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
            return `${i + 1}. ${j.name} (${j.slug})\n   ${describeCron(j.schedule)}\n   ${j.prompt.slice(0, 50)}${j.prompt.length > 50 ? "..." : ""}`
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
          prompt: tool.schema.string().optional().describe("Updated prompt"),
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

          let runResult
          try {
            runResult = runJobNow(job)
          } catch (error) {
            const msg = error instanceof Error ? error.message : String(error)
            return errorResult(format, `Failed to start job "${job.name}": ${msg}`)
          }

          const logs = getJobLogs(job.slug)
          const attachHint = job.attachUrl ? `\nAttach: opencode attach ${job.attachUrl}` : ""
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
          format: tool.schema.string().optional().describe("Optional: output format ('text' or 'json')."),
        },
        async execute(args) {
          const format = normalizeFormat(args.format)
          const job = findJobByName(args.name)

          if (!job) {
            return errorResult(format, `Job "${args.name}" not found.`)
          }

          const logs = getJobLogs(job.slug)
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
