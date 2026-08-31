/** Unit tests for cron conversion and transactional systemd installation. */
import { afterEach, describe, expect, test } from "bun:test"
import {
  chmodSync,
  existsSync,
  lstatSync,
  mkdirSync,
  mkdtempSync,
  readFileSync,
  readlinkSync,
  renameSync,
  rmSync,
  statSync,
  symlinkSync,
  unlinkSync,
  writeFileSync,
} from "fs"
import { tmpdir } from "os"
import { join } from "path"
import { spawn, spawnSync } from "child_process"
import { cronToSystemdCalendars } from "../src/cron"
import { installLinuxScheduler, installSystemdWithCronFallback } from "../src/backend"
import { readExecutableVersion } from "../src/process"
import { deriveSafeScopeId } from "../src/identifiers"
import { resolveExecutable, type ExecutableProbeDependencies } from "../src/executable"
import {
  installSystemdUnits,
  SystemdFallbackSafeError,
  SystemdNonFallbackError,
  withSystemdRuntimeEnv,
  type SystemdCommandRunner,
  type SystemdFileSystem,
} from "../src/systemd"

const sandboxes = new Set<string>()

function sandbox(): string {
  const path = mkdtempSync(join(tmpdir(), "opencode-scheduler-test-"))
  sandboxes.add(path)
  return path
}

afterEach(() => {
  for (const path of sandboxes) rmSync(path, { recursive: true, force: true })
  sandboxes.clear()
})

describe("cronToSystemdCalendars", () => {
  const cases: Array<[string, string[]]> = [
    ["0 9 * * *", ["*-*-* 09:00:00"]],
    ["0 */6 * * *", ["*-*-* 00:00:00", "*-*-* 06:00:00", "*-*-* 12:00:00", "*-*-* 18:00:00"]],
    ["30 8 * * 1", ["Mon *-*-* 08:30:00"]],
    ["0 10 6 9 *", ["*-09-06 10:00:00"]],
    ["0 9 13 * 5", ["*-*-13 09:00:00", "Fri *-*-* 09:00:00"]],
  ]

  for (const [cron, expected] of cases) {
    test(`converts ${cron}`, () => expect(cronToSystemdCalendars(cron)).toEqual(expected))
  }

  const hasSystemdAnalyze = spawnSync("systemd-analyze", ["--version"], { stdio: "ignore" }).status === 0
  test.skipIf(!hasSystemdAnalyze)("emits calendars accepted by systemd-analyze", () => {
    for (const [cron] of cases) {
      for (const calendar of cronToSystemdCalendars(cron)) {
        expect(spawnSync("systemd-analyze", ["calendar", calendar], { stdio: "ignore" }).status).toBe(0)
      }
    }
  })
})

describe("withSystemdRuntimeEnv", () => {
  test("preserves inherited runtime and bus values", () => {
    const env = withSystemdRuntimeEnv(
      { XDG_RUNTIME_DIR: "/inherited", DBUS_SESSION_BUS_ADDRESS: "unix:path=/inherited/bus" },
      { uid: () => 42, exists: () => true }
    )
    expect(env.XDG_RUNTIME_DIR).toBe("/inherited")
    expect(env.DBUS_SESSION_BUS_ADDRESS).toBe("unix:path=/inherited/bus")
  })

  test("derives runtime directory and bus", () => {
    const env = withSystemdRuntimeEnv({}, { uid: () => 42, exists: (path) => ["/run/user/42", "/run/user/42/bus"].includes(path) })
    expect(env.XDG_RUNTIME_DIR).toBe("/run/user/42")
    expect(env.DBUS_SESSION_BUS_ADDRESS).toBe("unix:path=/run/user/42/bus")
  })

  test("does not derive values when runtime directory is absent", () => {
    const env = withSystemdRuntimeEnv({}, { uid: () => 42, exists: () => false })
    expect(env.XDG_RUNTIME_DIR).toBeUndefined()
    expect(env.DBUS_SESSION_BUS_ADDRESS).toBeUndefined()
  })

  test("does not derive a bus when the socket is absent", () => {
    const env = withSystemdRuntimeEnv({}, { uid: () => 42, exists: (path) => path === "/run/user/42" })
    expect(env.XDG_RUNTIME_DIR).toBe("/run/user/42")
    expect(env.DBUS_SESSION_BUS_ADDRESS).toBeUndefined()
  })
})

describe("safe executable version probing", () => {
  for (const executable of ['bad";touch /tmp/pwn', "$(touch /tmp/pwn)", "bad\ncommand"] as const) {
    test(`passes override literally without a shell: ${JSON.stringify(executable)}`, () => {
      const calls: Array<{ file: string; args: readonly string[] }> = []
      const version = readExecutableVersion(executable, {}, (file, args) => {
        calls.push({ file, args })
        const error = new Error("ENOENT") as NodeJS.ErrnoException
        error.code = "ENOENT"
        throw error
      })
      expect(version).toBeNull()
      expect(calls).toEqual([{ file: executable, args: ["--version"] }])
    })
  }
})

describe("shell-free executable resolution", () => {
  const dependencies = (files: Set<string>, platform: NodeJS.Platform = "linux"): ExecutableProbeDependencies => ({
    platform,
    cwd: () => "/cwd",
    isFile: (path) => files.has(path),
    access: (path) => { if (!files.has(path)) throw new Error("EACCES") },
  })

  test("finds crontab without executing its unsupported --version flag", () => {
    expect(resolveExecutable("crontab", { PATH: "/usr/bin:/bin" }, dependencies(new Set(["/usr/bin/crontab"])))).toBe("/usr/bin/crontab")
  })

  test("returns false for missing and non-executable candidates", () => {
    const probe = dependencies(new Set(["/usr/bin/crontab"]))
    probe.access = () => { throw new Error("EACCES") }
    expect(resolveExecutable("crontab", { PATH: "/usr/bin" }, probe)).toBeNull()
    expect(resolveExecutable("missing", { PATH: "/usr/bin" }, dependencies(new Set()))).toBeNull()
  })

  test("treats PATH metacharacters literally and empty entry as cwd", () => {
    const files = new Set(["/literal;$(touch pwn)/crontab", "/cwd/tool"])
    expect(resolveExecutable("crontab", { PATH: "/literal;$(touch pwn)" }, dependencies(files))).toBe("/literal;$(touch pwn)/crontab")
    expect(resolveExecutable("tool", { PATH: "" }, dependencies(files))).toBe("/cwd/tool")
  })

  test("uses PATHEXT candidates on Windows without execution", () => {
    const files = new Set(["C:\\bin\\crontab.EXE"])
    expect(resolveExecutable("crontab", { PATH: "C:\\bin", PATHEXT: ".EXE;.CMD" }, dependencies(files, "win32"))).toBe("C:\\bin\\crontab.EXE")
  })
})

describe("identifier length compatibility", () => {
  test("truncates long generated workspace scope while retaining hash", () => {
    const scope = deriveSafeScopeId(`/tmp/${"workspace".repeat(80)}`)
    expect(Buffer.byteLength(scope)).toBeLessThanOrEqual(96)
    expect(scope).toMatch(/-[0-9a-f]{12}$/)
  })

  test("accepts historically safe long persisted slug when final unit fits NAME_MAX", () => {
    const root = sandbox()
    const slug = "a".repeat(220)
    const state: FakeState = { unitFileState: "disabled", active: false, calls: [] }
    installSystemdUnits({ unitDir: root, serviceUnit: `${slug}.service`, timerUnit: `${slug}.timer`, lockKey: slug, serviceContent: "new", timerContent: "new", run: fakeRunner(state) })
    expect(existsSync(join(root, `${slug}.timer`))).toBe(true)
  })

  test("rejects over-limit safe unit before mutation", () => {
    const root = sandbox()
    const slug = "a".repeat(250)
    let calls = 0
    expect(() => installSystemdUnits({ unitDir: root, serviceUnit: `${slug}.service`, timerUnit: `${slug}.timer`, lockKey: slug, serviceContent: "new", timerContent: "new", run: () => { calls += 1; return Buffer.alloc(0) } })).toThrow("Invalid")
    expect(calls).toBe(0)
    expect(existsSync(join(root, ".opencode-scheduler-locks"))).toBe(false)
  })
})

type FailurePoint = "first-write" | "second-write" | "second-chmod" | "daemon-reload" | "enable" | "start"

interface FakeState {
  unitFileState: string
  active: boolean
  calls: string[]
}

function fakeRunner(state: FakeState, failure?: FailurePoint): SystemdCommandRunner {
  return (_executable, args) => {
    const command = args.join(" ")
    state.calls.push(command)
    if (command.includes("is-enabled")) return Buffer.from(`${state.unitFileState}\n`)
    if (command.includes("is-active")) return Buffer.from(state.active ? "active\n" : "inactive\n")
    if (failure === "daemon-reload" && command.endsWith("daemon-reload") && state.calls.filter((call) => call.endsWith("daemon-reload")).length === 1) throw new Error(failure)
    if (failure === "enable" && command.includes(" enable ")) throw new Error(failure)
    if (failure === "start" && command.includes(" start ") && state.calls.filter((call) => call.includes(" start ")).length === 1) throw new Error(failure)
    if (command.includes(" enable --runtime ")) state.unitFileState = "enabled-runtime"
    else if (command.includes(" enable ")) state.unitFileState = "enabled"
    if (command.includes(" disable ")) state.unitFileState = "disabled"
    if (command.includes(" start ")) state.active = true
    if (command.includes(" stop ")) state.active = false
    return Buffer.alloc(0)
  }
}

function failingFileSystem(point?: FailurePoint): SystemdFileSystem | undefined {
  if (!point?.includes("write") && point !== "second-chmod") return undefined
  let writes = 0
  let chmods = 0
  return {
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
    writeFile: (path, data, options) => {
      writes += 1
      if ((point === "first-write" && writes === 1) || (point === "second-write" && writes === 2)) throw new Error(point)
      writeFileSync(path, data, options)
    },
    chmod: (path, mode) => {
      chmods += 1
      if (point === "second-chmod" && chmods === 2) throw new Error(point)
      chmodSync(path, mode)
    },
  }
}

function install(root: string, state: FakeState, failure?: FailurePoint, lock?: { timeoutMs?: number; staleAfterMs?: number; pollMs?: number }): void {
  installSystemdUnits({
    unitDir: root,
    serviceUnit: "job.service",
    timerUnit: "job.timer",
    serviceContent: "new service",
    timerContent: "new timer",
    run: fakeRunner(state, failure),
    fileSystem: failingFileSystem(failure),
    lock,
  })
}

describe("installSystemdUnits transaction", () => {
  for (const value of ["bad;id", "$(id)", "bad\nunit", "bad/unit", "-leading", "bad name"] as const) {
    test(`rejects unsafe unit and lock identifiers before mutation: ${JSON.stringify(value)}`, () => {
      const root = sandbox()
      let runnerCalls = 0
      const run: SystemdCommandRunner = () => { runnerCalls += 1; return Buffer.alloc(0) }
      expect(() => installSystemdUnits({
        unitDir: root,
        serviceUnit: `${value}.service`,
        timerUnit: "job.timer",
        lockKey: value,
        serviceContent: "new",
        timerContent: "new",
        run,
      })).toThrow("Invalid")
      expect(runnerCalls).toBe(0)
      expect(existsSync(join(root, "job.timer"))).toBe(false)
      expect(existsSync(join(root, ".opencode-scheduler-locks"))).toBe(false)
    })
  }

  test("passes validated units as typed argv without shell construction", () => {
    const root = sandbox()
    const invocations: Array<{ executable: string; args: readonly string[] }> = []
    let enabled = false
    let active = false
    const run: SystemdCommandRunner = (executable, args) => {
      invocations.push({ executable, args })
      if (args[1] === "is-enabled") return Buffer.from(enabled ? "enabled\n" : "disabled\n")
      if (args[1] === "is-active") return Buffer.from(active ? "active\n" : "inactive\n")
      if (args[1] === "enable") enabled = true
      if (args[1] === "start") active = true
      return Buffer.alloc(0)
    }
    installSystemdUnits({ unitDir: root, serviceUnit: "job.service", timerUnit: "job.timer", lockKey: "real-scope-123", serviceContent: "new", timerContent: "new", run })
    expect(invocations.every((call) => call.executable === "systemctl")).toBe(true)
    expect(invocations).toContainEqual({ executable: "systemctl", args: ["--user", "enable", "job.timer"] })
    expect(invocations).toContainEqual({ executable: "systemctl", args: ["--user", "start", "job.timer"] })
  })
  test("aborts before mutation when prior timer state cannot be captured", () => {
    const root = sandbox()
    const service = join(root, "job.service")
    writeFileSync(service, "old service")
    const run: SystemdCommandRunner = () => {
      throw new Error("bus unavailable")
    }
    expect(() => installSystemdUnits({
      unitDir: root,
      serviceUnit: "job.service",
      timerUnit: "job.timer",
      serviceContent: "new service",
      timerContent: "new timer",
      run,
    })).toThrow("Unable to determine")
    expect(readFileSync(service, "utf8")).toBe("old service")
    expect(existsSync(join(root, "job.timer"))).toBe(false)
  })

  test("clean install writes 0644 files and starts an enabled timer", () => {
    const root = sandbox()
    const state: FakeState = { unitFileState: "disabled", active: false, calls: [] }
    install(root, state)
    expect(readFileSync(join(root, "job.service"), "utf8")).toBe("new service")
    expect(statSync(join(root, "job.timer")).mode & 0o777).toBe(0o644)
    expect(state.unitFileState).toBe("enabled")
    expect(state.active).toBe(true)
  })

  for (const failure of ["first-write", "second-write", "second-chmod", "daemon-reload", "enable", "start"] as FailurePoint[]) {
    test(`clean install rolls back ${failure} failure`, () => {
      const root = sandbox()
      const state: FakeState = { unitFileState: "disabled", active: false, calls: [] }
      expect(() => install(root, state, failure)).toThrow(failure)
      expect(existsSync(join(root, "job.service"))).toBe(false)
      expect(existsSync(join(root, "job.timer"))).toBe(false)
      expect(state.unitFileState).toBe("disabled")
      expect(state.active).toBe(false)
    })
  }

  for (const failure of ["second-write", "daemon-reload", "enable", "start"] as FailurePoint[]) {
    test(`update restores exact files, modes, and state after ${failure}`, () => {
      const root = sandbox()
      const service = join(root, "job.service")
      const timer = join(root, "job.timer")
      writeFileSync(service, "old service", { mode: 0o600 })
      writeFileSync(timer, "old timer", { mode: 0o640 })
      chmodSync(service, 0o600)
      chmodSync(timer, 0o640)
      const state: FakeState = { unitFileState: "enabled", active: true, calls: [] }
      expect(() => install(root, state, failure)).toThrow(failure)
      expect(readFileSync(service, "utf8")).toBe("old service")
      expect(readFileSync(timer, "utf8")).toBe("old timer")
      expect(statSync(service).mode & 0o777).toBe(0o600)
      expect(statSync(timer).mode & 0o777).toBe(0o640)
      expect(state.unitFileState).toBe("enabled")
      expect(state.active).toBe(true)
    })
  }

  test("migrates enabled active legacy timer without removing legacy files", () => {
    const root = sandbox()
    const legacyService = join(root, "legacy.service")
    const legacyTimer = join(root, "legacy.timer")
    writeFileSync(legacyService, "legacy service")
    writeFileSync(legacyTimer, "legacy timer")
    const states = new Map<string, { enabled: string; active: boolean }>([
      ["job.timer", { enabled: "disabled", active: false }],
      ["legacy.timer", { enabled: "enabled", active: true }],
    ])
    const calls: string[] = []
    const run: SystemdCommandRunner = (_executable, args) => {
    const command = args.join(" ")
      calls.push(command)
      const unit = command.split(" ").at(-1)!
      const state = states.get(unit)
      if (command.includes("is-enabled")) return Buffer.from(`${state?.enabled ?? "not-found"}\n`)
      if (command.includes("is-active")) return Buffer.from(state?.active ? "active\n" : "inactive\n")
      if (state && command.includes(" disable ")) state.enabled = "disabled"
      if (state && command.includes(" enable ")) state.enabled = "enabled"
      if (state && command.includes(" stop ")) state.active = false
      if (state && command.includes(" start ")) state.active = true
      return Buffer.alloc(0)
    }
    installSystemdUnits({
      unitDir: root, serviceUnit: "job.service", timerUnit: "job.timer",
      legacyServiceUnit: "legacy.service", legacyTimerUnit: "legacy.timer", lockKey: "shared-slug",
      serviceContent: "new service", timerContent: "new timer", run,
    })
    expect(states.get("legacy.timer")).toEqual({ enabled: "disabled", active: false })
    expect(states.get("job.timer")).toEqual({ enabled: "enabled", active: true })
    expect(readFileSync(legacyService, "utf8")).toBe("legacy service")
    expect(readFileSync(legacyTimer, "utf8")).toBe("legacy timer")
    expect(calls.filter((call) => call.includes("legacy.timer") && call.includes(" stop "))).toHaveLength(2)
  })

  for (const failure of ["first-write", "second-write", "second-chmod", "daemon-reload", "enable", "start"] as FailurePoint[]) {
    test(`legacy migration restores exact files, links, and state after ${failure}`, () => {
      const root = sandbox()
      symlinkSync("/dev/null", join(root, "legacy.service"))
      symlinkSync("../old/legacy.timer", join(root, "legacy.timer"))
      const states = new Map<string, { enabled: string; active: boolean }>([
        ["job.timer", { enabled: "disabled", active: false }],
        ["legacy.timer", { enabled: "enabled", active: true }],
      ])
      const calls: string[] = []
      let unitWrites = 0
      let unitChmods = 0
      const fileSystem: SystemdFileSystem = {
        chmod: (path, mode) => {
          if (String(path).includes("job.") && !String(path).includes("owner.json")) {
            unitChmods += 1
            if (failure === "second-chmod" && unitChmods === 2) throw new Error(failure)
          }
          chmodSync(path, mode)
        },
        exists: existsSync, lstat: lstatSync, mkdir: mkdirSync, readFile: readFileSync, readlink: readlinkSync,
        rename: renameSync, rm: rmSync, stat: statSync, symlink: symlinkSync, unlink: unlinkSync,
        writeFile: (path, data, options) => {
          if (String(path).includes("job.") && !String(path).includes("owner.json")) {
            unitWrites += 1
            if ((failure === "first-write" && unitWrites === 1) || (failure === "second-write" && unitWrites === 2)) throw new Error(failure)
          }
          writeFileSync(path, data, options)
        },
      }
      const run: SystemdCommandRunner = (_executable, args) => {
    const command = args.join(" ")
        calls.push(command)
        const unit = command.split(" ").at(-1)!
        const state = states.get(unit)
        if (command.includes("is-enabled")) return Buffer.from(`${state?.enabled ?? "not-found"}\n`)
        if (command.includes("is-active")) return Buffer.from(state?.active ? "active\n" : "inactive\n")
        if (failure === "daemon-reload" && command.endsWith("daemon-reload") && calls.filter((call) => call.endsWith("daemon-reload")).length === 1) throw new Error(failure)
        if (failure === "enable" && unit === "job.timer" && command.includes(" enable ")) throw new Error(failure)
        if (failure === "start" && unit === "job.timer" && command.includes(" start ") && calls.filter((call) => call.includes(" start job.timer")).length === 1) throw new Error(failure)
        if (state && command.includes(" disable ")) state.enabled = "disabled"
        if (state && command.includes(" enable ")) state.enabled = "enabled"
        if (state && command.includes(" stop ")) state.active = false
        if (state && command.includes(" start ")) state.active = true
        return Buffer.alloc(0)
      }
      expect(() => installSystemdUnits({
        unitDir: root, serviceUnit: "job.service", timerUnit: "job.timer",
        legacyServiceUnit: "legacy.service", legacyTimerUnit: "legacy.timer", lockKey: "shared-slug",
        serviceContent: "new", timerContent: "new", run, fileSystem,
      })).toThrow(SystemdNonFallbackError)
      expect(states.get("legacy.timer")).toEqual({ enabled: "enabled", active: true })
      expect(readlinkSync(join(root, "legacy.service"))).toBe("/dev/null")
      expect(readlinkSync(join(root, "legacy.timer"))).toBe("../old/legacy.timer")
      expect(existsSync(join(root, "job.service"))).toBe(false)
      expect(existsSync(join(root, "job.timer"))).toBe(false)
    })
  }

  test("no legacy files skips legacy state queries and remains a clean install", () => {
    const root = sandbox()
    const state: FakeState = { unitFileState: "disabled", active: false, calls: [] }
    installSystemdUnits({
      unitDir: root, serviceUnit: "job.service", timerUnit: "job.timer",
      legacyServiceUnit: "legacy.service", legacyTimerUnit: "legacy.timer", lockKey: "shared-slug",
      serviceContent: "new", timerContent: "new", run: fakeRunner(state),
    })
    expect(state.calls.some((call) => call.includes("legacy.timer"))).toBe(false)
  })

  for (const legacyState of ["linked", "linked-runtime"] as const) {
    test(`successful migration restores exact ${legacyState} symlink after disable unlinks it`, () => {
      const root = sandbox()
      const target = legacyState === "linked" ? "../external/legacy.timer" : "/run/user/1000/systemd/legacy.timer"
      const legacyTimer = join(root, "legacy.timer")
      symlinkSync(target, legacyTimer)
      const calls: string[] = []
      let legacyActive = true
      let scopedActive = false
      const run: SystemdCommandRunner = (_executable, args) => {
    const command = args.join(" ")
        calls.push(command)
        if (command.includes("is-enabled legacy.timer")) return Buffer.from(`${legacyState}\n`)
        if (command.includes("is-active legacy.timer")) return Buffer.from(legacyActive ? "active\n" : "inactive\n")
        if (command.includes("is-enabled job.timer")) return Buffer.from("disabled\n")
        if (command.includes("is-active job.timer")) return Buffer.from(scopedActive ? "active\n" : "inactive\n")
        if (command.includes("stop legacy.timer")) legacyActive = false
        if (command.includes("disable legacy.timer")) unlinkSync(legacyTimer)
        if (command.includes("start job.timer")) scopedActive = true
        return Buffer.alloc(0)
      }
      installSystemdUnits({
        unitDir: root, lockKey: "shared", serviceUnit: "job.service", timerUnit: "job.timer",
        legacyServiceUnit: "legacy.service", legacyTimerUnit: "legacy.timer",
        serviceContent: "new", timerContent: "new", run,
      })
      expect(lstatSync(legacyTimer).isSymbolicLink()).toBe(true)
      expect(readlinkSync(legacyTimer)).toBe(target)
      expect(legacyActive).toBe(false)
      expect(scopedActive).toBe(true)
      expect(calls.some((call) => call.includes("enable legacy.timer"))).toBe(false)
      expect(calls.filter((call) => call.includes("stop legacy.timer"))).toHaveLength(2)
    })
  }

  for (const target of ["/dev/null", "../units/original.timer"] as const) {
    for (const failure of ["first-write", "second-write", "second-chmod", "daemon-reload", "enable", "start"] as FailurePoint[]) {
      test(`restores symlink target ${target} after ${failure}`, () => {
        const root = sandbox()
        const service = join(root, "job.service")
        const timer = join(root, "job.timer")
        symlinkSync(target, service)
        symlinkSync(target, timer)
        const state: FakeState = {
          unitFileState: target === "/dev/null" ? "masked" : "linked",
          active: false,
          calls: [],
        }
        expect(() => install(root, state, failure)).toThrow(failure)
        expect(lstatSync(service).isSymbolicLink()).toBe(true)
        expect(lstatSync(timer).isSymbolicLink()).toBe(true)
        expect(readlinkSync(service)).toBe(target)
        expect(readlinkSync(timer)).toBe(target)
        expect(state.calls.some((call) => call.includes(" unmask "))).toBe(false)
      })
    }
  }

  for (const unitFileState of ["linked", "linked-runtime", "masked", "masked-runtime", "static", "indirect"] as const) {
    test(`does not enable or disable while restoring ${unitFileState} state`, () => {
      const root = sandbox()
      const target = unitFileState.startsWith("masked") ? "/dev/null" : "../units/job.timer"
      symlinkSync(target, join(root, "job.service"))
      symlinkSync(target, join(root, "job.timer"))
      const state: FakeState = { unitFileState, active: false, calls: [] }
      expect(() => install(root, state, "daemon-reload")).toThrow("daemon-reload")
      expect(readlinkSync(join(root, "job.timer"))).toBe(target)
      const rollbackCalls = state.calls.slice(state.calls.findIndex((call) => call.endsWith("daemon-reload")) + 1)
      expect(rollbackCalls.some((call) => call.includes(" enable ") || call.includes(" disable "))).toBe(false)
      expect(rollbackCalls.some((call) => call.includes(" unmask ") || call.includes(" link "))).toBe(false)
    })
  }

  test("rejects generated state before mutation", () => {
    const root = sandbox()
    const service = join(root, "job.service")
    writeFileSync(service, "old")
    const state: FakeState = { unitFileState: "generated", active: false, calls: [] }
    expect(() => install(root, state)).toThrow("Cannot safely restore")
    expect(readFileSync(service, "utf8")).toBe("old")
  })

  test("times out without breaking a live cross-process lock", () => {
    const root = sandbox()
    const lockRoot = join(root, "locks")
    const lockPath = join(lockRoot, "job.timer.lock")
    mkdirSync(lockPath, { recursive: true })
    writeFileSync(join(lockPath, "owner.json"), JSON.stringify({ pid: process.pid, timestamp: Date.now() - 120_000 }))
    const state: FakeState = { unitFileState: "disabled", active: false, calls: [] }
    expect(() => installSystemdUnits({
      unitDir: root,
      lockDir: lockRoot,
      serviceUnit: "job.service",
      timerUnit: "job.timer",
      serviceContent: "new service",
      timerContent: "new timer",
      run: fakeRunner(state),
      lock: { timeoutMs: 10, pollMs: 1, staleAfterMs: 1 },
    })).toThrow("Timed out waiting")
    expect(existsSync(lockPath)).toBe(true)
    expect(state.calls).toEqual([])
  })

  test("removes a dead stale lock and releases its own lock after failure", () => {
    const root = sandbox()
    const lockRoot = join(root, "locks")
    const lockPath = join(lockRoot, "job.timer.lock")
    mkdirSync(lockPath, { recursive: true })
    writeFileSync(join(lockPath, "owner.json"), JSON.stringify({ pid: 2147483647, timestamp: 0 }))
    const state: FakeState = { unitFileState: "disabled", active: false, calls: [] }
    expect(() => installSystemdUnits({
      unitDir: root,
      lockDir: lockRoot,
      serviceUnit: "job.service",
      timerUnit: "job.timer",
      serviceContent: "new service",
      timerContent: "new timer",
      run: fakeRunner(state, "daemon-reload"),
      lock: { timeoutMs: 20, pollMs: 1, staleAfterMs: 1 },
    })).toThrow("daemon-reload")
    expect(existsSync(lockPath)).toBe(false)
  })

  test("refuses a symlink lock without touching its target", () => {
    const root = sandbox()
    const lockRoot = join(root, "locks")
    const target = join(root, "target")
    mkdirSync(lockRoot)
    mkdirSync(target)
    writeFileSync(join(target, "keep"), "safe")
    symlinkSync(target, join(lockRoot, "job.timer.lock"))
    const state: FakeState = { unitFileState: "disabled", active: false, calls: [] }
    expect(() => installSystemdUnits({
      unitDir: root, lockDir: lockRoot, serviceUnit: "job.service", timerUnit: "job.timer",
      serviceContent: "new", timerContent: "new", run: fakeRunner(state),
    })).toThrow("lock symlink")
    expect(readFileSync(join(target, "keep"), "utf8")).toBe("safe")
    expect(lstatSync(join(lockRoot, "job.timer.lock")).isSymbolicLink()).toBe(true)
  })

  test("reclaims stale lock with malformed metadata through quarantine", () => {
    const root = sandbox()
    const lockRoot = join(root, "locks")
    const lockPath = join(lockRoot, "job.timer.lock")
    mkdirSync(lockPath, { recursive: true })
    writeFileSync(join(lockPath, "owner.json"), "not-json")
    const old = new Date(0)
    require("fs").utimesSync(lockPath, old, old)
    const state: FakeState = { unitFileState: "disabled", active: false, calls: [] }
    installSystemdUnits({
      unitDir: root, lockDir: lockRoot, serviceUnit: "job.service", timerUnit: "job.timer",
      serviceContent: "new", timerContent: "new", run: fakeRunner(state),
      lock: { staleAfterMs: 1, timeoutMs: 100 },
    })
    expect(existsSync(lockPath)).toBe(false)
  })

  test("PRIMARY_WRITE is not masked by CLEANUP_UNLINK", () => {
    const root = sandbox()
    const fileSystem = failingFileSystem("first-write")!
    fileSystem.unlink = () => { throw new Error("CLEANUP_UNLINK") }
    const state: FakeState = { unitFileState: "disabled", active: false, calls: [] }
    expect(() => installSystemdUnits({
      unitDir: root, lockDir: join(root, "locks"), serviceUnit: "job.service", timerUnit: "job.timer",
      serviceContent: "new", timerContent: "new", run: fakeRunner(state), fileSystem,
    })).toThrow("first-write")
  })

  test("PRIMARY_RELOAD is not masked by LOCK_RELEASE", () => {
    const root = sandbox()
    const fileSystem = failingFileSystem() ?? {
      chmod: chmodSync, exists: existsSync, lstat: lstatSync, mkdir: mkdirSync, readFile: readFileSync,
      readlink: readlinkSync, rename: renameSync, rm: rmSync, stat: statSync, symlink: symlinkSync,
      unlink: unlinkSync, writeFile: writeFileSync,
    }
    const originalRm = fileSystem.rm
    fileSystem.rm = (path, options) => {
      if (String(path).includes("job.timer.release-")) throw new Error("LOCK_RELEASE")
      return originalRm(path, options)
    }
    const state: FakeState = { unitFileState: "disabled", active: false, calls: [] }
    expect(() => installSystemdUnits({
      unitDir: root, lockDir: join(root, "locks"), serviceUnit: "job.service", timerUnit: "job.timer",
      serviceContent: "new", timerContent: "new", run: fakeRunner(state, "daemon-reload"), fileSystem,
    })).toThrow("daemon-reload")
  })

  test("successful transaction reports lock release warning without failing", () => {
    const root = sandbox()
    const fileSystem: SystemdFileSystem = {
      chmod: chmodSync, exists: existsSync, lstat: lstatSync, mkdir: mkdirSync, readFile: readFileSync,
      readlink: readlinkSync, rename: renameSync, rm: (path, options) => {
        if (String(path).includes("job.timer.release-")) throw new Error("LOCK_RELEASE")
        return rmSync(path, options)
      }, stat: statSync, symlink: symlinkSync, unlink: unlinkSync, writeFile: writeFileSync,
    }
    const state: FakeState = { unitFileState: "disabled", active: false, calls: [] }
    const warnings: Array<{ message: string; error: unknown }> = []
    installSystemdUnits({
      unitDir: root, lockDir: join(root, "locks"), serviceUnit: "job.service", timerUnit: "job.timer",
      serviceContent: "new", timerContent: "new", run: fakeRunner(state), fileSystem,
      onWarning: (message, error) => warnings.push({ message, error }),
    })
    expect(warnings).toHaveLength(1)
    expect(warnings[0].message).toContain("is installed")
    expect(warnings[0].error).toBeInstanceOf(Error)
  })

  test("completed orphan with same live PID is reclaimed by the next operation", () => {
    const root = sandbox()
    const lockRoot = join(root, "locks")
    let failRelease = true
    const fileSystem: SystemdFileSystem = {
      chmod: chmodSync, exists: existsSync, lstat: lstatSync, mkdir: mkdirSync, readFile: readFileSync,
      readlink: readlinkSync, rename: renameSync, rm: (path, options) => {
        if (failRelease && String(path).includes("shared.release-")) throw new Error("LOCK_RELEASE")
        return rmSync(path, options)
      }, stat: statSync, symlink: symlinkSync, unlink: unlinkSync, writeFile: writeFileSync,
    }
    const first: FakeState = { unitFileState: "disabled", active: false, calls: [] }
    installSystemdUnits({ unitDir: root, lockDir: lockRoot, lockKey: "shared", serviceUnit: "one.service", timerUnit: "one.timer", serviceContent: "one", timerContent: "one", run: fakeRunner(first), fileSystem })
    expect(existsSync(lockRoot)).toBe(true)
    failRelease = false
    const second: FakeState = { unitFileState: "disabled", active: false, calls: [] }
    installSystemdUnits({ unitDir: root, lockDir: lockRoot, lockKey: "shared", serviceUnit: "two.service", timerUnit: "two.timer", serviceContent: "two", timerContent: "two", run: fakeRunner(second), fileSystem, lock: { timeoutMs: 50, pollMs: 1 } })
    expect(readFileSync(join(root, "two.timer"), "utf8")).toBe("two")
    expect(existsSync(join(lockRoot, "shared.lock"))).toBe(false)
  })

  test("active lock owned by the same live PID is not reclaimed", () => {
    const root = sandbox()
    const lockPath = join(root, "locks", "shared.lock")
    mkdirSync(lockPath, { recursive: true })
    writeFileSync(join(lockPath, "owner.json"), JSON.stringify({ pid: process.pid, timestamp: 0, token: "active-token", phase: "active" }))
    const state: FakeState = { unitFileState: "disabled", active: false, calls: [] }
    expect(() => installSystemdUnits({ unitDir: root, lockDir: join(root, "locks"), lockKey: "shared", serviceUnit: "job.service", timerUnit: "job.timer", serviceContent: "new", timerContent: "new", run: fakeRunner(state), lock: { timeoutMs: 5, pollMs: 1, staleAfterMs: 1 } })).toThrow(SystemdNonFallbackError)
    expect(state.calls).toEqual([])
  })

  test("OWNER_WRITE is not masked by OWNER_CLEANUP", () => {
    const root = sandbox()
    const fileSystem: SystemdFileSystem = {
      chmod: chmodSync, exists: existsSync, lstat: lstatSync, mkdir: mkdirSync, readFile: readFileSync,
      readlink: readlinkSync, rename: renameSync, rm: () => { throw new Error("OWNER_CLEANUP") },
      stat: statSync, symlink: symlinkSync, unlink: unlinkSync,
      writeFile: (path, data, options) => {
        if (String(path).includes("owner.json")) throw new Error("OWNER_WRITE")
        writeFileSync(path, data, options)
      },
    }
    const state: FakeState = { unitFileState: "disabled", active: false, calls: [] }
    expect(() => installSystemdUnits({
      unitDir: root, lockDir: join(root, "locks"), serviceUnit: "job.service", timerUnit: "job.timer",
      serviceContent: "new", timerContent: "new", run: fakeRunner(state), fileSystem,
    })).toThrow("OWNER_WRITE")
  })

  test("a second process cannot interleave with a live installer", async () => {
    const root = sandbox()
    const marker = join(root, "locked")
    const child = spawn("bun", [join(import.meta.dir, "fixtures", "systemd-lock-child.ts"), root, marker, "success"], {
      stdio: "ignore",
    })
    try {
      for (let attempt = 0; attempt < 100 && !existsSync(marker); attempt += 1) {
        await Bun.sleep(5)
      }
      expect(existsSync(marker)).toBe(true)
      const state: FakeState = { unitFileState: "disabled", active: false, calls: [] }
      expect(() => installSystemdUnits({
        unitDir: root,
        lockDir: join(root, "locks"),
        serviceUnit: "job.service",
        timerUnit: "job.timer",
        serviceContent: "second service",
        timerContent: "second timer",
        run: fakeRunner(state),
        lock: { timeoutMs: 20, pollMs: 1 },
      })).toThrow("Timed out waiting")
      expect(state.calls).toEqual([])
      expect(readFileSync(join(root, "job.service"), "utf8")).toBe("child service")
    } finally {
      child.kill()
      await new Promise<void>((resolve) => child.once("exit", () => resolve()))
    }
  })

  test("a failed first process releases the lock before a successful second install", async () => {
    const root = sandbox()
    const marker = join(root, "locked")
    const child = spawn("bun", [join(import.meta.dir, "fixtures", "systemd-lock-child.ts"), root, marker, "fail"], {
      stdio: "ignore",
    })
    for (let attempt = 0; attempt < 100 && !existsSync(marker); attempt += 1) await Bun.sleep(5)
    expect(existsSync(marker)).toBe(true)
    const childExit = await new Promise<number | null>((resolve) => child.once("exit", (code) => resolve(code)))
    expect(childExit).not.toBe(0)
    const state: FakeState = { unitFileState: "disabled", active: false, calls: [] }
    installSystemdUnits({
      unitDir: root,
      lockDir: join(root, "locks"),
      serviceUnit: "job.service",
      timerUnit: "job.timer",
      serviceContent: "second service",
      timerContent: "second timer",
      run: fakeRunner(state),
      lock: { timeoutMs: 500, pollMs: 2 },
    })
    expect(readFileSync(join(root, "job.service"), "utf8")).toBe("second service")
    expect(readFileSync(join(root, "job.timer"), "utf8")).toBe("second timer")
  })

  test("simultaneous stale reclaimers serialize through an atomic quarantine claim", async () => {
    const root = sandbox()
    const lockPath = join(root, "locks", "job.timer.lock")
    const ledger = join(root, "ledger")
    mkdirSync(lockPath, { recursive: true })
    writeFileSync(join(lockPath, "owner.json"), JSON.stringify({ pid: 2147483647, timestamp: 0 }))
    const fixture = join(import.meta.dir, "fixtures", "systemd-stale-reclaimer.ts")
    const children = ["a", "b", "c"].map((id) => spawn("bun", [fixture, root, ledger, id], { stdio: "ignore" }))
    const exits = await Promise.all(children.map((child) => new Promise<number | null>((resolve) => child.once("exit", resolve))))
    expect(exits).toEqual([0, 0, 0])
    const events = readFileSync(ledger, "utf8").trim().split("\n")
    let active = 0
    let maximum = 0
    for (const event of events) {
      active += event.startsWith("start:") ? 1 : -1
      maximum = Math.max(maximum, active)
    }
    expect(maximum).toBe(1)
    expect(active).toBe(0)
    expect(events).toHaveLength(6)
  })

  test("cross-process release quarantine cannot delete a fresh active lock", async () => {
    const root = sandbox()
    const ledger = join(root, "release-ledger")
    const fixture = join(import.meta.dir, "fixtures", "systemd-release-race.ts")
    const first = spawn("bun", [fixture, root, ledger, "a", "0"], { stdio: "ignore" })
    const second = spawn("bun", [fixture, root, ledger, "b", "30"], { stdio: "ignore" })
    const exits = await Promise.all([first, second].map((child) => new Promise<number | null>((resolve) => child.once("exit", resolve))))
    expect(exits).toEqual([0, 0])
    const events = readFileSync(ledger, "utf8").trim().split("\n")
    expect(events).toEqual(["transaction:a", "transaction:b"])
    expect(readFileSync(join(root, "b.timer"), "utf8")).toBe("b")
  })
})

describe("systemd backend fallback integration", () => {
  test("post-commit lock warning leaves exactly one systemd schedule and no cron fallback", () => {
    const root = sandbox()
    let cronInstalls = 0
    const state: FakeState = { unitFileState: "disabled", active: false, calls: [] }
    const fileSystem: SystemdFileSystem = {
      chmod: chmodSync, exists: existsSync, lstat: lstatSync, mkdir: mkdirSync, readFile: readFileSync,
      readlink: readlinkSync, rename: renameSync, rm: (path, options) => {
        if (String(path).includes("job.timer.release-")) throw new Error("LOCK_RELEASE")
        return rmSync(path, options)
      }, stat: statSync, symlink: symlinkSync, unlink: unlinkSync, writeFile: writeFileSync,
    }
    const backend = installSystemdWithCronFallback({
      installSystemd: () => installSystemdUnits({
        unitDir: root, lockDir: join(root, "locks"), serviceUnit: "job.service", timerUnit: "job.timer",
        serviceContent: "service", timerContent: "timer", run: fakeRunner(state), fileSystem,
      }),
      isCronAvailable: () => true,
      installCron: () => { cronInstalls += 1 },
    })
    expect(backend).toBe("systemd")
    expect(cronInstalls).toBe(0)
    expect(state.calls.filter((call) => call.includes(" start "))).toHaveLength(1)
    expect(readFileSync(join(root, "job.timer"), "utf8")).toBe("timer")
  })

  test("genuine backend unavailable selection installs cron exactly once", () => {
    let cronInstalls = 0
    let systemdInstalls = 0
    const selectedBackend = installLinuxScheduler({
      systemdAvailable: false,
      installSystemd: () => { systemdInstalls += 1 },
      isCronAvailable: () => true,
      installCron: () => { cronInstalls += 1 },
    })
    expect(selectedBackend).toBe("cron")
    expect(cronInstalls).toBe(1)
    expect(systemdInstalls).toBe(0)
  })

  test("fully rolled-back clean install failure installs cron exactly once", () => {
    let cronInstalls = 0
    const backend = installSystemdWithCronFallback({
      installSystemd: () => { throw new SystemdFallbackSafeError("SYSTEMD_FAILED") },
      isCronAvailable: () => true,
      installCron: () => { cronInstalls += 1 },
    })
    expect(backend).toBe("cron")
    expect(cronInstalls).toBe(1)
  })

  test("live lock timeout is non-fallback and starts neither backend", () => {
    const root = sandbox()
    const lockPath = join(root, "locks", "job.timer.lock")
    mkdirSync(lockPath, { recursive: true })
    writeFileSync(join(lockPath, "owner.json"), JSON.stringify({ pid: process.pid, timestamp: Date.now() }))
    let systemdTransactions = 0
    let cronInstalls = 0
    expect(() => installSystemdWithCronFallback({
      installSystemd: () => installSystemdUnits({
        unitDir: root, lockDir: join(root, "locks"), serviceUnit: "job.service", timerUnit: "job.timer",
        serviceContent: "service", timerContent: "timer", run: () => { systemdTransactions += 1; return Buffer.alloc(0) },
        lock: { timeoutMs: 5, pollMs: 1 },
      }),
      isCronAvailable: () => true,
      installCron: () => { cronInstalls += 1 },
    })).toThrow(SystemdNonFallbackError)
    expect(systemdTransactions).toBe(0)
    expect(cronInstalls).toBe(0)
  })

  test("real clean transaction failure rolls back before safe cron fallback", () => {
    const root = sandbox()
    let cronInstalls = 0
    const state: FakeState = { unitFileState: "disabled", active: false, calls: [] }
    const backend = installSystemdWithCronFallback({
      installSystemd: () => installSystemdUnits({
        unitDir: root, lockDir: join(root, "locks"), serviceUnit: "job.service", timerUnit: "job.timer",
        serviceContent: "service", timerContent: "timer", run: fakeRunner(state, "daemon-reload"),
      }),
      isCronAvailable: () => true,
      installCron: () => { cronInstalls += 1 },
    })
    expect(backend).toBe("cron")
    expect(cronInstalls).toBe(1)
    expect(existsSync(join(root, "job.service"))).toBe(false)
    expect(existsSync(join(root, "job.timer"))).toBe(false)
  })

  test("existing schedule transaction failure is non-fallback even after restoration", () => {
    const root = sandbox()
    writeFileSync(join(root, "job.service"), "old service")
    writeFileSync(join(root, "job.timer"), "old timer")
    let cronInstalls = 0
    const state: FakeState = { unitFileState: "enabled", active: true, calls: [] }
    expect(() => installSystemdWithCronFallback({
      installSystemd: () => installSystemdUnits({
        unitDir: root, lockDir: join(root, "locks"), serviceUnit: "job.service", timerUnit: "job.timer",
        serviceContent: "new", timerContent: "new", run: fakeRunner(state, "daemon-reload"),
      }),
      isCronAvailable: () => true,
      installCron: () => { cronInstalls += 1 },
    })).toThrow(SystemdNonFallbackError)
    expect(cronInstalls).toBe(0)
    expect(readFileSync(join(root, "job.timer"), "utf8")).toBe("old timer")
  })
})
