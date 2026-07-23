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

import { readFileSync, writeFileSync, unlinkSync, existsSync, mkdirSync, appendFileSync } from "fs"
import { join, dirname } from "path"
import { homedir } from "os"
import { spawn, execSync } from "child_process"
import { randomUUID } from "crypto"

// --- Helpers ---

function isoNow(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "+0000")
}

function readJson<T = unknown>(path: string): T {
  return JSON.parse(readFileSync(path, "utf-8")) as T
}

function writeJsonAtomic(path: string, data: unknown): void {
  const tmp = `${path}.tmp.${process.pid}`
  writeFileSync(tmp, JSON.stringify(data, null, 2))
  // Atomic rename on NTFS
  const fs = require("fs")
  fs.renameSync(tmp, path)
}

function appendJsonl(path: string, record: unknown): void {
  appendFileSync(path, JSON.stringify(record) + "\n")
}

function pidAlive(pid: number): boolean {
  if (!pid) return false
  try {
    process.kill(pid, 0)
    return true
  } catch {
    return false
  }
}

function randomId(): string {
  return randomUUID().replace(/-/g, "").slice(0, 16)
}

function ensureDir(dir: string): void {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true })
  }
}

// --- Main ---

const jobPath = process.argv[2]
if (!jobPath) {
  console.error("usage: supervisor.js <job.json>")
  process.exit(1)
}

const job = readJson<Record<string, any>>(jobPath)
const scopeId = job.scopeId || ""
const slug = job.slug || ""
if (!scopeId || !slug) {
  console.error("job missing scopeId/slug")
  process.exit(1)
}

const home = homedir()
if (!home) {
  console.error("HOME is not set")
  process.exit(1)
}

// Paths (Windows-style)
const configRoot = join(home, ".config", "opencode")
const schedulerRoot = join(configRoot, "scheduler", "scopes", scopeId)
const locksDir = join(schedulerRoot, "locks")
const runsDir = join(schedulerRoot, "runs")
const logsDir = join(configRoot, "logs", "scheduler", scopeId)

ensureDir(locksDir)
ensureDir(runsDir)
ensureDir(logsDir)

// Log file path — redirect stdout/stderr
const logPath = join(logsDir, `${slug}.log`)
const logStream = require("fs").createWriteStream(logPath, { flags: "a" })

function log(msg: string): void {
  const line = `${msg}\n`
  process.stdout.write(line)
  logStream.write(line)
}

// --- No-overlap check ---

const lockPath = join(locksDir, `${slug}.json`)
if (existsSync(lockPath)) {
  try {
    const lock = readJson<{ pid?: number }>(lockPath)
    const pid = lock?.pid || 0
    if (pidAlive(pid)) {
      log(`\n=== Scheduled run skipped (already running pid=${pid}) ${isoNow()} ===`)
      logStream.end()
      process.exit(0)
    }
  } catch {
    // corrupt lock, remove it
  }
  unlinkSync(lockPath)
}

// --- Start run ---

const runId = `${Date.now()}-${randomId()}`
const startedAt = isoNow()
const t0 = Date.now()

writeJsonAtomic(lockPath, { pid: process.pid, startedAt, runId })

// Update job metadata: running
job.lastRunAt = startedAt
job.lastRunSource = "scheduled"
job.lastRunStatus = "running"
delete job.lastRunExitCode
delete job.lastRunError
job.updatedAt = startedAt
writeJsonAtomic(jobPath, job)

// Force non-interactive scheduled runs
const basePolicy: Record<string, string> = { question: "deny" }
let perm = basePolicy
if (process.env.OPENCODE_PERMISSION) {
  try {
    const existing = JSON.parse(process.env.OPENCODE_PERMISSION) as Record<string, string>
    if (existing && typeof existing === "object") {
      perm = { ...existing, ...basePolicy }
    }
  } catch {}
}
process.env.OPENCODE_PERMISSION = JSON.stringify(perm)
process.env.OPENCODE_SCHEDULER_RUN_ID = runId

log(`\n=== Scheduled run ${startedAt} runId=${runId} ===`)

// --- Validate invocation ---

const inv = job.invocation as { command?: string; args?: string[] } | undefined
if (!inv?.command || !Array.isArray(inv?.args)) {
  log(`\n=== Supervisor error ${isoNow()}: job missing invocation.command/args ===`)
  job.lastRunStatus = "failed"
  job.lastRunError = "job missing invocation"
  job.updatedAt = isoNow()
  writeJsonAtomic(jobPath, job)
  unlinkSync(lockPath)
  logStream.end()
  process.exit(1)
}

const command = inv.command
const args = inv.args
const workdir = job.workdir || home

const timeout = typeof job.timeoutSeconds === "number" && job.timeoutSeconds > 0
  ? job.timeoutSeconds
  : undefined

// --- Spawn child process ---

log(`\n=== Running: ${command} ${args.join(" ").slice(0, 200)} ===`)

const child = spawn(command, args, {
  cwd: workdir,
  stdio: ["ignore", "pipe", "pipe"],
  detached: false, // Windows: no setsid equivalent needed
  env: { ...process.env },
})

// Pipe child stdout/stderr to log
child.stdout?.pipe(logStream, { end: false })
child.stderr?.pipe(logStream, { end: false })

let timedOut = false
let timer: ReturnType<typeof setTimeout> | undefined

if (timeout) {
  timer = setTimeout(() => {
    timedOut = true
    log(`\n=== Timeout after ${timeout} seconds ${isoNow()}; killing process ===`)
    // Windows: use taskkill /T for tree kill (no SIGTERM equivalent)
    try {
      execSync(`taskkill /PID ${child.pid} /T /F`, { stdio: "ignore" })
    } catch {
      // Process may have already exited
    }
  }, timeout * 1000)
}

// --- Wait for completion ---

child.on("close", (code) => {
  if (timer) clearTimeout(timer)

  const finishedAt = isoNow()
  const durationMs = Date.now() - t0
  const exitCode = timedOut ? 124 : (code ?? 1)

  let finalStatus: string
  let finalError: string | undefined

  if (timedOut) {
    finalStatus = "failed"
    finalError = "timeout"
  } else if (code === 0) {
    finalStatus = "success"
  } else {
    finalStatus = "failed"
    finalError = `exit code ${exitCode}`
  }

  // Update job metadata
  job.lastRunStatus = finalStatus
  job.lastRunExitCode = exitCode
  if (finalError) job.lastRunError = finalError
  job.updatedAt = finishedAt
  writeJsonAtomic(jobPath, job)

  // Append run record
  appendJsonl(join(runsDir, `${slug}.jsonl`), {
    runId,
    scopeId,
    slug,
    startedAt,
    finishedAt,
    durationMs,
    status: finalStatus,
    exitCode,
    error: finalError,
    pid: child.pid,
    logPath,
  })

  // Release lock
  try { unlinkSync(lockPath) } catch {}

  log(`\n=== Finished ${finishedAt} status=${finalStatus} exitCode=${exitCode} durationMs=${durationMs} ===`)
  logStream.end(() => {
    process.exit(exitCode)
  })
})

child.on("error", (err) => {
  if (timer) clearTimeout(timer)

  const finishedAt = isoNow()
  const durationMs = Date.now() - t0

  job.lastRunStatus = "failed"
  job.lastRunError = err.message
  job.updatedAt = finishedAt
  writeJsonAtomic(jobPath, job)

  appendJsonl(join(runsDir, `${slug}.jsonl`), {
    runId,
    scopeId,
    slug,
    startedAt,
    finishedAt,
    durationMs,
    status: "failed",
    exitCode: 1,
    error: err.message,
    pid: child.pid,
    logPath,
  })

  try { unlinkSync(lockPath) } catch {}

  log(`\n=== Finished ${finishedAt} status=failed error=${err.message} durationMs=${durationMs} ===`)
  logStream.end(() => {
    process.exit(1)
  })
})
