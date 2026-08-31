import {
  chmodSync,
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  readlinkSync,
  renameSync,
  rmSync,
  statSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "fs"
import { join } from "path"
import type { ExecFileSyncOptions } from "child_process"

export type SystemdCommandRunner = (executable: "systemctl", args: readonly string[], options?: ExecFileSyncOptions) => Buffer | string

const SAFE_IDENTIFIER = /^[a-z0-9][a-z0-9-]*$/
const SAFE_UNIT = /^[a-z0-9][a-z0-9-]*\.(service|timer)$/
const NAME_MAX_BYTES = 255

function validateInstallRequest(request: SystemdInstallRequest): void {
  const invalid = (label: string, value: string | undefined, pattern: RegExp) => {
    if (value !== undefined && (!pattern.test(value) || Buffer.byteLength(value, "utf8") > NAME_MAX_BYTES)) {
      throw new Error(`Invalid ${label}: ${JSON.stringify(value)}`)
    }
  }
  invalid("service unit", request.serviceUnit, SAFE_UNIT)
  invalid("timer unit", request.timerUnit, SAFE_UNIT)
  invalid("legacy service unit", request.legacyServiceUnit, SAFE_UNIT)
  invalid("legacy timer unit", request.legacyTimerUnit, SAFE_UNIT)
  invalid("lock key", request.lockKey, SAFE_IDENTIFIER)
}

export class SystemdNonFallbackError extends Error {
  readonly fallbackSafe = false
  readonly originalError: unknown

  constructor(message: string, originalError?: unknown) {
    super(message)
    this.name = "SystemdNonFallbackError"
    this.originalError = originalError
  }
}

export class SystemdFallbackSafeError extends Error {
  readonly fallbackSafe = true
  readonly originalError: unknown

  constructor(message: string, originalError?: unknown) {
    super(message)
    this.name = "SystemdFallbackSafeError"
    this.originalError = originalError
  }
}

export interface RuntimeEnvDependencies {
  exists: (path: string) => boolean
  uid: () => number | undefined
}

const defaultRuntimeEnvDependencies: RuntimeEnvDependencies = {
  exists: existsSync,
  uid: () => process.getuid?.(),
}

export function withSystemdRuntimeEnv(
  env: NodeJS.ProcessEnv,
  dependencies: RuntimeEnvDependencies = defaultRuntimeEnvDependencies
): NodeJS.ProcessEnv {
  const next: NodeJS.ProcessEnv = { ...env }
  if (!next.XDG_RUNTIME_DIR) {
    const uid = dependencies.uid()
    if (typeof uid === "number") {
      const runtimeDir = `/run/user/${uid}`
      if (dependencies.exists(runtimeDir)) next.XDG_RUNTIME_DIR = runtimeDir
    }
  }
  if (!next.DBUS_SESSION_BUS_ADDRESS && next.XDG_RUNTIME_DIR) {
    const busPath = join(next.XDG_RUNTIME_DIR, "bus")
    if (dependencies.exists(busPath)) next.DBUS_SESSION_BUS_ADDRESS = `unix:path=${busPath}`
  }
  return next
}

type FileSnapshot =
  | { path: string; type: "missing" }
  | { path: string; type: "regular"; content: Buffer; mode: number }
  | { path: string; type: "symlink"; target: string }

type UnitFileState =
  | "enabled"
  | "enabled-runtime"
  | "disabled"
  | "static"
  | "indirect"
  | "masked"
  | "masked-runtime"
  | "linked"
  | "linked-runtime"
  | "alias"
  | "not-found"

export interface SystemdInstallRequest {
  unitDir: string
  lockDir?: string
  serviceUnit: string
  timerUnit: string
  serviceContent: string
  timerContent: string
  lockKey?: string
  legacyServiceUnit?: string
  legacyTimerUnit?: string
  run: SystemdCommandRunner
  fileSystem?: SystemdFileSystem
  lock?: Partial<SystemdLockOptions>
  onWarning?: (message: string, error: unknown) => void
}

export interface SystemdFileSystem {
  chmod: typeof chmodSync
  exists: typeof existsSync
  lstat: typeof lstatSync
  mkdir: typeof mkdirSync
  readFile: typeof readFileSync
  readlink: typeof readlinkSync
  rename: typeof renameSync
  rm: typeof rmSync
  stat: typeof statSync
  symlink: typeof symlinkSync
  unlink: typeof unlinkSync
  writeFile: typeof writeFileSync
}

const defaultFileSystem: SystemdFileSystem = {
  chmod: chmodSync,
  exists: existsSync,
  lstat: lstatSync,
  mkdir: mkdirSync,
  readFile: readFileSync,
  readlink: readlinkSync,
  rename: renameSync,
  rm: rmSync,
  stat: statSync,
  symlink: symlinkSync,
  unlink: unlinkSync,
  writeFile: writeFileSync,
}

interface SystemdLockOptions {
  timeoutMs: number
  staleAfterMs: number
  pollMs: number
  now: () => number
  pid: number
  isPidAlive: (pid: number) => boolean
  sleep: (milliseconds: number) => void
}

interface LockMetadata {
  pid?: number
  timestamp?: number
  token?: string
  phase?: "active" | "completed"
}

interface LockHandle {
  release: () => void
}

const sleepArray = new Int32Array(new SharedArrayBuffer(4))
const defaultLockOptions: SystemdLockOptions = {
  timeoutMs: 10_000,
  staleAfterMs: 60_000,
  pollMs: 25,
  now: Date.now,
  pid: process.pid,
  isPidAlive(pid) {
    try {
      process.kill(pid, 0)
      return true
    } catch {
      return false
    }
  },
  sleep(milliseconds) {
    Atomics.wait(sleepArray, 0, 0, milliseconds)
  },
}

function snapshotFile(path: string, fileSystem: SystemdFileSystem): FileSnapshot {
  let stats: ReturnType<typeof lstatSync>
  try {
    stats = fileSystem.lstat(path)
  } catch (error) {
    if (isErrorCode(error, "ENOENT")) return { path, type: "missing" }
    throw error
  }
  if (stats.isSymbolicLink()) return { path, type: "symlink", target: fileSystem.readlink(path) }
  if (stats.isFile()) {
    return { path, type: "regular", content: fileSystem.readFile(path), mode: stats.mode & 0o777 }
  }
  throw new Error(`Unsupported systemd unit node type at ${path}; refusing to mutate it`)
}

let temporaryFileSequence = 0

function temporaryPath(path: string): string {
  temporaryFileSequence += 1
  return `${path}.tmp-${process.pid}-${temporaryFileSequence}`
}

function atomicReplace(path: string, content: string | Buffer, mode: number, fileSystem: SystemdFileSystem): void {
  const temporary = temporaryPath(path)
  let primaryError: unknown
  try {
    fileSystem.writeFile(temporary, content, { mode })
    fileSystem.chmod(temporary, mode)
    fileSystem.rename(temporary, path)
    fileSystem.chmod(path, mode)
  } catch (error) {
    primaryError = error
    throw error
  } finally {
    if (primaryError) bestEffort(() => removeNode(temporary, fileSystem))
    else removeNode(temporary, fileSystem)
  }
}

function atomicSymlink(path: string, target: string, fileSystem: SystemdFileSystem): void {
  const temporary = temporaryPath(path)
  let primaryError: unknown
  try {
    fileSystem.symlink(target, temporary)
    fileSystem.rename(temporary, path)
  } catch (error) {
    primaryError = error
    throw error
  } finally {
    if (primaryError) bestEffort(() => removeNode(temporary, fileSystem))
    else removeNode(temporary, fileSystem)
  }
}

function removeNode(path: string, fileSystem: SystemdFileSystem): void {
  try {
    fileSystem.unlink(path)
  } catch (error) {
    if (!isErrorCode(error, "ENOENT")) throw error
  }
}

function commandOutput(value: unknown): string {
  if (Buffer.isBuffer(value)) return value.toString().trim()
  if (typeof value === "string") return value.trim()
  if (typeof value === "object" && value !== null && "stdout" in value) {
    const stdout = (value as { stdout?: unknown }).stdout
    if (Buffer.isBuffer(stdout)) return stdout.toString().trim()
    if (typeof stdout === "string") return stdout.trim()
  }
  return ""
}

function queryUnitFileState(run: SystemdCommandRunner, timerUnit: string): UnitFileState {
  let output = ""
  try {
    output = commandOutput(run("systemctl", ["--user", "is-enabled", timerUnit], { stdio: ["ignore", "pipe", "ignore"] }))
  } catch (error) {
    output = commandOutput(error)
  }
  const supported: UnitFileState[] = [
    "enabled", "enabled-runtime", "disabled", "static", "indirect", "masked", "masked-runtime",
    "linked", "linked-runtime", "alias", "not-found",
  ]
  if (supported.includes(output as UnitFileState)) return output as UnitFileState
  const unrecoverable = ["generated", "transient", "bad"]
  if (unrecoverable.includes(output)) {
    throw new Error(`Cannot safely restore ${timerUnit} from systemd unit-file state ${output}; refusing to mutate it`)
  }
  throw new Error(`Unable to determine ${timerUnit} unit-file state: ${output || "no status returned"}`)
}

function queryActiveState(run: SystemdCommandRunner, timerUnit: string): boolean {
  let output = ""
  try {
    output = commandOutput(run("systemctl", ["--user", "is-active", timerUnit], { stdio: ["ignore", "pipe", "ignore"] }))
  } catch (error) {
    output = commandOutput(error)
  }
  if (["active", "activating", "reloading"].includes(output)) return true
  if (["inactive", "failed", "deactivating", "unknown"].includes(output)) return false
  throw new Error(`Unable to determine whether ${timerUnit} is active: ${output || "no status returned"}`)
}

function restoreFile(snapshot: FileSnapshot, fileSystem: SystemdFileSystem): void {
  if (snapshot.type === "missing") {
    removeNode(snapshot.path, fileSystem)
  } else if (snapshot.type === "symlink") {
    atomicSymlink(snapshot.path, snapshot.target, fileSystem)
  } else {
    atomicReplace(snapshot.path, snapshot.content, snapshot.mode, fileSystem)
  }
}

function bestEffort(action: () => void): void {
  try {
    action()
  } catch {}
}

function attempt(action: () => void): boolean {
  try {
    action()
    return true
  } catch {
    return false
  }
}

function restoreUnitFileState(run: SystemdCommandRunner, timerUnit: string, state: UnitFileState): void {
  if (state === "enabled") run("systemctl", ["--user", "enable", timerUnit], { stdio: "ignore" })
  if (state === "enabled-runtime") run("systemctl", ["--user", "enable", "--runtime", timerUnit], { stdio: "ignore" })
  if (state === "disabled") run("systemctl", ["--user", "disable", timerUnit], { stdio: "ignore" })
  // linked, masked, static, indirect, alias and not-found are represented by
  // the restored filesystem node or by immutable unit metadata. Running
  // enable/disable here would change their exact prior state.
}

function isErrorCode(error: unknown, code: string): boolean {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: unknown }).code === code
}

function readLockMetadata(lockPath: string, fileSystem: SystemdFileSystem): LockMetadata {
  try {
    const parsed = JSON.parse(fileSystem.readFile(join(lockPath, "owner.json"), "utf8")) as unknown
    if (typeof parsed !== "object" || parsed === null) return {}
    const record = parsed as Record<string, unknown>
    return {
      pid: typeof record.pid === "number" ? record.pid : undefined,
      timestamp: typeof record.timestamp === "number" ? record.timestamp : undefined,
      token: typeof record.token === "string" ? record.token : undefined,
      phase: record.phase === "active" || record.phase === "completed" ? record.phase : undefined,
    }
  } catch {
    return {}
  }
}

function writeLockMetadata(lockPath: string, metadata: Required<LockMetadata>, fileSystem: SystemdFileSystem): void {
  atomicReplace(join(lockPath, "owner.json"), JSON.stringify(metadata), 0o600, fileSystem)
}

function acquireLock(
  lockRoot: string,
  timerUnit: string,
  fileSystem: SystemdFileSystem,
  overrides?: Partial<SystemdLockOptions>
): LockHandle {
  const options = { ...defaultLockOptions, ...overrides }
  fileSystem.mkdir(lockRoot, { recursive: true })
  const lockPath = join(lockRoot, `${timerUnit}.lock`)
  const token = `${options.pid}-${options.now()}-${temporaryFileSequence += 1}`
  const startedAt = options.now()
  while (true) {
    try {
      fileSystem.mkdir(lockPath)
      try {
        writeLockMetadata(lockPath, { pid: options.pid, timestamp: options.now(), token, phase: "active" }, fileSystem)
      } catch (error) {
        bestEffort(() => fileSystem.rm(lockPath, { recursive: true, force: true }))
        throw error
      }
      return {
        release() {
          const observed = readLockMetadata(lockPath, fileSystem)
          if (observed.token !== token || observed.phase !== "active") {
            throw new Error(`Refusing to release systemd lock whose ownership changed: ${lockPath}`)
          }
          const observedStats = fileSystem.lstat(lockPath)
          const quarantinePath = join(lockRoot, `${timerUnit}.release-${token}`)
          fileSystem.rename(lockPath, quarantinePath)
          const claimedStats = fileSystem.lstat(quarantinePath)
          const claimed = readLockMetadata(quarantinePath, fileSystem)
          if (
            claimed.token !== token ||
            claimed.phase !== "active" ||
            claimedStats.dev !== observedStats.dev ||
            claimedStats.ino !== observedStats.ino
          ) {
            // Never delete a node that was not the lock instance we observed.
            try {
              fileSystem.rename(quarantinePath, lockPath)
            } catch (restoreError) {
              if (!isErrorCode(restoreError, "EEXIST")) throw restoreError
            }
            throw new Error(`Systemd lock changed during release claim: ${lockPath}`)
          }
          writeLockMetadata(quarantinePath, { pid: options.pid, timestamp: options.now(), token, phase: "completed" }, fileSystem)
          fileSystem.rm(quarantinePath, { recursive: true, force: true })
        },
      }
    } catch (error) {
      if (!isErrorCode(error, "EEXIST")) throw error
      let lockStats: ReturnType<typeof lstatSync>
      try {
        lockStats = fileSystem.lstat(lockPath)
      } catch (inspectError) {
        if (isErrorCode(inspectError, "ENOENT")) continue
        throw inspectError
      }
      if (lockStats.isSymbolicLink()) {
        throw new Error(`Refusing systemd install lock symlink at ${lockPath}`)
      }
      if (!lockStats.isDirectory()) {
        throw new Error(`Refusing non-directory systemd install lock at ${lockPath}`)
      }
      const metadata = readLockMetadata(lockPath, fileSystem)
      const timestamp = metadata.timestamp ?? lockStats.mtimeMs
      const oldEnough = options.now() - timestamp >= options.staleAfterMs
      const ownerAlive = metadata.pid !== undefined && options.isPidAlive(metadata.pid)
      if (metadata.phase === "completed" || (oldEnough && !ownerAlive)) {
        const quarantinePath = join(lockRoot, `${timerUnit}.stale-${options.pid}-${options.now()}-${temporaryFileSequence += 1}`)
        try {
          fileSystem.rename(lockPath, quarantinePath)
        } catch (claimError) {
          if (isErrorCode(claimError, "ENOENT") || isErrorCode(claimError, "EEXIST")) continue
          throw claimError
        }
        fileSystem.rm(quarantinePath, { recursive: true, force: true })
        continue
      }
      if (options.now() - startedAt >= options.timeoutMs) {
        throw new Error(`Timed out waiting ${options.timeoutMs}ms for systemd install lock ${lockPath}`)
      }
      options.sleep(options.pollMs)
    }
  }
}

export function installSystemdUnits(request: SystemdInstallRequest): void {
  validateInstallRequest(request)
  const fileSystem = request.fileSystem ?? defaultFileSystem
  let lockHandle: LockHandle
  try {
    lockHandle = acquireLock(
      request.lockDir ?? join(request.unitDir, ".opencode-scheduler-locks"),
      request.lockKey ?? request.timerUnit,
      fileSystem,
      request.lock
    )
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    throw new SystemdNonFallbackError(
      `Systemd scheduler is busy or its install lock is unsafe (${detail}); retry after the current operation finishes. Cron fallback was not installed.`,
      error
    )
  }
  let primaryError: unknown
  try {
    fileSystem.mkdir(request.unitDir, { recursive: true })
    const servicePath = join(request.unitDir, request.serviceUnit)
    const timerPath = join(request.unitDir, request.timerUnit)
    const serviceSnapshot = snapshotFile(servicePath, fileSystem)
    const timerSnapshot = snapshotFile(timerPath, fileSystem)
    const unitFileState = queryUnitFileState(request.run, request.timerUnit)
    const wasActive = queryActiveState(request.run, request.timerUnit)
    const legacyServicePath = request.legacyServiceUnit ? join(request.unitDir, request.legacyServiceUnit) : undefined
    const legacyTimerPath = request.legacyTimerUnit ? join(request.unitDir, request.legacyTimerUnit) : undefined
    const legacyServiceSnapshot = legacyServicePath ? snapshotFile(legacyServicePath, fileSystem) : undefined
    const legacyTimerSnapshot = legacyTimerPath ? snapshotFile(legacyTimerPath, fileSystem) : undefined
    const legacyRelevant = Boolean(
      request.legacyTimerUnit &&
      (legacyServiceSnapshot?.type !== "missing" || legacyTimerSnapshot?.type !== "missing")
    )
    const legacyUnitFileState = legacyRelevant ? queryUnitFileState(request.run, request.legacyTimerUnit!) : undefined
    const legacyWasActive = legacyRelevant ? queryActiveState(request.run, request.legacyTimerUnit!) : false

    let enabledByAttempt = false
    try {
      if (legacyRelevant) {
        request.run("systemctl", ["--user", "stop", request.legacyTimerUnit!])
        request.run("systemctl", ["--user", "disable", request.legacyTimerUnit!])
        // disable may unlink linked/alias unit nodes; preserve the exact legacy
        // files while leaving the timer stopped and absent from target wants.
        if (legacyServiceSnapshot) restoreFile(legacyServiceSnapshot, fileSystem)
        if (legacyTimerSnapshot) restoreFile(legacyTimerSnapshot, fileSystem)
      }
      atomicReplace(servicePath, request.serviceContent, 0o644, fileSystem)
      atomicReplace(timerPath, request.timerContent, 0o644, fileSystem)
      request.run("systemctl", ["--user", "daemon-reload"])
      if (legacyRelevant) request.run("systemctl", ["--user", "stop", request.legacyTimerUnit!])
      request.run("systemctl", ["--user", "enable", request.timerUnit])
      enabledByAttempt = true
      request.run("systemctl", ["--user", "start", request.timerUnit])
    } catch (error) {
      let rollbackComplete = true
      if (!wasActive) rollbackComplete = attempt(() => request.run("systemctl", ["--user", "stop", request.timerUnit], { stdio: "ignore" })) && rollbackComplete
      if (enabledByAttempt) rollbackComplete = attempt(() => request.run("systemctl", ["--user", "disable", request.timerUnit], { stdio: "ignore" })) && rollbackComplete
      rollbackComplete = attempt(() => restoreFile(serviceSnapshot, fileSystem)) && rollbackComplete
      rollbackComplete = attempt(() => restoreFile(timerSnapshot, fileSystem)) && rollbackComplete
      if (legacyServiceSnapshot) rollbackComplete = attempt(() => restoreFile(legacyServiceSnapshot, fileSystem)) && rollbackComplete
      if (legacyTimerSnapshot) rollbackComplete = attempt(() => restoreFile(legacyTimerSnapshot, fileSystem)) && rollbackComplete
      rollbackComplete = attempt(() => request.run("systemctl", ["--user", "daemon-reload"], { stdio: "ignore" })) && rollbackComplete
      rollbackComplete = attempt(() => restoreUnitFileState(request.run, request.timerUnit, unitFileState)) && rollbackComplete
      if (wasActive) rollbackComplete = attempt(() => request.run("systemctl", ["--user", "start", request.timerUnit], { stdio: "ignore" })) && rollbackComplete
      if (legacyUnitFileState) rollbackComplete = attempt(() => restoreUnitFileState(request.run, request.legacyTimerUnit!, legacyUnitFileState)) && rollbackComplete
      if (legacyWasActive) rollbackComplete = attempt(() => request.run("systemctl", ["--user", "start", request.legacyTimerUnit!], { stdio: "ignore" })) && rollbackComplete

      const cleanPriorState =
        serviceSnapshot.type === "missing" &&
        timerSnapshot.type === "missing" &&
        !wasActive &&
        !legacyRelevant &&
        (unitFileState === "disabled" || unitFileState === "not-found")
      const detail = error instanceof Error ? error.message : String(error)
      if (cleanPriorState && rollbackComplete) {
        throw new SystemdFallbackSafeError(`Systemd install failed and was fully rolled back (${detail})`, error)
      }
      throw new SystemdNonFallbackError(
        `Systemd install failed, but cron fallback is unsafe because a prior or incompletely rolled-back schedule may exist (${detail})`,
        error
      )
    }
  } catch (error) {
    primaryError = error
    throw error
  } finally {
    if (primaryError) bestEffort(lockHandle.release)
    else {
      try {
        lockHandle.release()
      } catch (error) {
        request.onWarning?.(
          `Systemd schedule ${request.timerUnit} is installed, but its install lock could not be removed; cron fallback was not installed.`,
          error
        )
      }
    }
  }
}
