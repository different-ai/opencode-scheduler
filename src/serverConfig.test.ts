import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from "fs"
import { tmpdir } from "os"
import { join } from "path"
import { formatInstallServerConfigResult } from "./index"
import {
  DEFAULT_OPENCODE_CONFIG_PATH,
  DEFAULT_SERVER_PORT,
  executeInstallServerConfig,
  planServerConfigUpdate,
  readOpencodeConfig,
  writeOpencodeConfigAtomic,
} from "./serverConfig"

let tmp: string
let configPath: string

beforeEach(() => {
  tmp = mkdtempSync(join(tmpdir(), "scheduler-server-config-"))
  configPath = join(tmp, "opencode.json")
})

afterEach(() => {
  try {
    rmSync(tmp, { recursive: true, force: true })
  } catch {}
})

describe("DEFAULT_SERVER_PORT / DEFAULT_OPENCODE_CONFIG_PATH", () => {
  test("default port is 0 — matches CLI --port 0 contract (requires F7)", () => {
    expect(DEFAULT_SERVER_PORT).toBe(0)
  })

  test("default config path resolves under home", () => {
    expect(DEFAULT_OPENCODE_CONFIG_PATH).toMatch(/\.config\/opencode\/opencode\.json$/)
  })
})

describe("readOpencodeConfig", () => {
  test("returns {} when the file does not exist", () => {
    expect(readOpencodeConfig(join(tmp, "missing.json"))).toEqual({})
  })

  test("returns {} for an empty file (post-touch state)", () => {
    writeFileSync(configPath, "")
    expect(readOpencodeConfig(configPath)).toEqual({})
    writeFileSync(configPath, "   \n  \t  ")
    expect(readOpencodeConfig(configPath)).toEqual({})
  })

  test("parses a valid object", () => {
    writeFileSync(configPath, JSON.stringify({ model: "gpt-4", server: { port: 4096 } }))
    expect(readOpencodeConfig(configPath)).toEqual({ model: "gpt-4", server: { port: 4096 } })
  })

  test("rejects a non-object top-level value (array)", () => {
    writeFileSync(configPath, "[1,2,3]")
    expect(() => readOpencodeConfig(configPath)).toThrow(/not a JSON object/)
  })

  test("rejects null at top-level", () => {
    writeFileSync(configPath, "null")
    expect(() => readOpencodeConfig(configPath)).toThrow(/not a JSON object/)
  })

  test("propagates JSON parse errors so we never overwrite a corrupt file", () => {
    writeFileSync(configPath, "{not json")
    expect(() => readOpencodeConfig(configPath)).toThrow()
  })
})

describe("planServerConfigUpdate", () => {
  test("no `server` block: action=add-server, preserves other top-level keys", () => {
    const plan = planServerConfigUpdate({ model: "gpt-4", username: "me" }, 0)
    expect(plan.action).toEqual({ kind: "add-server", port: 0 })
    expect(plan.after).toEqual({ model: "gpt-4", username: "me", server: { port: 0 } })
    expect(plan.diff).toContain("+ server")
  })

  test("`server` exists without `port`: action=add-port, preserves other server keys", () => {
    const plan = planServerConfigUpdate({ server: { hostname: "127.0.0.1", cors: ["x"] } }, 0)
    expect(plan.action).toEqual({ kind: "add-port", port: 0 })
    expect(plan.after.server).toEqual({ hostname: "127.0.0.1", cors: ["x"], port: 0 })
    expect(plan.diff).toContain("+ server.port")
  })

  test("`server.port` already matches: action=noop", () => {
    const plan = planServerConfigUpdate({ server: { port: 0 } }, 0)
    expect(plan.action).toEqual({ kind: "noop", reason: "port-already-matches" })
    expect(plan.after).toEqual({ server: { port: 0 } })
    expect(plan.diff).toContain("no change")
  })

  test("`server.port` differs: action=overwrite-port with previous + next", () => {
    const plan = planServerConfigUpdate({ server: { port: 4096 } }, 0)
    expect(plan.action).toEqual({ kind: "overwrite-port", previous: 4096, next: 0 })
    expect(plan.diff).toContain("4096")
    expect(plan.diff).toContain("0")
  })

  test("non-numeric existing server.port throws — refuse to guess", () => {
    expect(() => planServerConfigUpdate({ server: { port: "abc" as unknown as number } }, 0)).toThrow(/not a number/)
  })

  test("planner does NOT mutate input objects", () => {
    const input = { server: { port: 4096, hostname: "127.0.0.1" } }
    const before = JSON.parse(JSON.stringify(input))
    planServerConfigUpdate(input, 0)
    expect(input).toEqual(before)
  })
})

describe("writeOpencodeConfigAtomic", () => {
  test("creates the file (and missing parent directory)", () => {
    const nested = join(tmp, "deep", "opencode.json")
    writeOpencodeConfigAtomic(nested, { model: "x", server: { port: 0 } })
    expect(readOpencodeConfig(nested)).toEqual({ model: "x", server: { port: 0 } })
  })

  test("overwrites an existing file in place", () => {
    writeFileSync(configPath, JSON.stringify({ model: "old" }))
    writeOpencodeConfigAtomic(configPath, { model: "new" })
    expect(readOpencodeConfig(configPath)).toEqual({ model: "new" })
  })

  test("output is pretty-printed with a trailing newline", () => {
    const { serialized } = writeOpencodeConfigAtomic(configPath, { server: { port: 0 } })
    expect(serialized.endsWith("\n")).toBe(true)
    expect(serialized).toContain('"port": 0')
  })

  test("no leftover .tmp file visible after rename", () => {
    writeOpencodeConfigAtomic(configPath, { server: { port: 0 } })
    // Atomic write goes through `<path>.tmp.<pid>.<ts>`; after the
    // rename completes the only file in the directory should be the
    // final destination — anything else means temp cleanup is broken.
    const stragglers = readdirSync(tmp).filter((entry) => entry.includes(".tmp."))
    expect(stragglers).toEqual([])
  })
})

describe("executeInstallServerConfig (orchestration)", () => {
  test("invalid port: status=invalid-port", () => {
    const result = executeInstallServerConfig({ port: -1, configPath })
    expect(result).toEqual({ ok: false, status: "invalid-port", reason: expect.stringContaining("integer") } as never)
  })

  test("invalid port: too high", () => {
    const result = executeInstallServerConfig({ port: 70000, configPath })
    expect(result.status).toBe("invalid-port")
  })

  test("invalid port: float", () => {
    const result = executeInstallServerConfig({ port: 4096.5, configPath })
    expect(result.status).toBe("invalid-port")
  })

  test("no config + no confirm: returns preview status with add-server plan", () => {
    const result = executeInstallServerConfig({ configPath })
    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error("expected ok")
    expect(result.status).toBe("preview")
    if (result.status !== "preview") throw new Error("expected preview")
    expect(result.plan.action.kind).toBe("add-server")
    // Sanity: not actually written yet.
    expect(readOpencodeConfig(configPath)).toEqual({})
  })

  test("no config + confirm=true: writes, status=written", () => {
    const result = executeInstallServerConfig({ confirm: true, configPath })
    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error("expected ok")
    expect(result.status).toBe("written")
    expect(readOpencodeConfig(configPath)).toEqual({ server: { port: 0 } })
  })

  test("server exists without port + confirm=true: only adds port, preserves siblings", () => {
    writeFileSync(configPath, JSON.stringify({ model: "x", server: { hostname: "127.0.0.1" } }))
    const result = executeInstallServerConfig({ port: 4096, confirm: true, configPath })
    expect(result.ok).toBe(true)
    expect(readOpencodeConfig(configPath)).toEqual({
      model: "x",
      server: { hostname: "127.0.0.1", port: 4096 },
    })
  })

  test("port already matches: status=noop, no write performed", () => {
    writeFileSync(configPath, JSON.stringify({ server: { port: 0 } }))
    const before = readFileSync(configPath, "utf-8")
    const result = executeInstallServerConfig({ confirm: true, configPath })
    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error("expected ok")
    expect(result.status).toBe("noop")
    // File untouched (same exact bytes — proves we did NOT rewrite).
    expect(readFileSync(configPath, "utf-8")).toBe(before)
  })

  test("existing different port + no overwrite + confirm: status=needs-overwrite, no write", () => {
    writeFileSync(configPath, JSON.stringify({ server: { port: 4096 } }))
    const before = readFileSync(configPath, "utf-8")
    const result = executeInstallServerConfig({ port: 0, confirm: true, configPath })
    expect(result.ok).toBe(false)
    if (result.ok) throw new Error("expected not ok")
    expect(result.status).toBe("needs-overwrite")
    if (result.status !== "needs-overwrite") throw new Error("status guard")
    expect(result.plan.action.kind).toBe("overwrite-port")
    expect(readFileSync(configPath, "utf-8")).toBe(before)
  })

  test("existing different port + overwrite=true + confirm=true: rewrites", () => {
    writeFileSync(configPath, JSON.stringify({ model: "keep", server: { port: 4096, hostname: "h" } }))
    const result = executeInstallServerConfig({ port: 0, overwrite: true, confirm: true, configPath })
    expect(result.ok).toBe(true)
    expect(readOpencodeConfig(configPath)).toEqual({
      model: "keep",
      server: { port: 0, hostname: "h" },
    })
  })

  test("existing different port + overwrite=true + no confirm: still preview-only", () => {
    writeFileSync(configPath, JSON.stringify({ server: { port: 4096 } }))
    const result = executeInstallServerConfig({ port: 0, overwrite: true, configPath })
    expect(result.ok).toBe(true)
    if (!result.ok) throw new Error("expected ok")
    expect(result.status).toBe("preview")
  })

  test("read-error on a corrupt config: status=read-error, file untouched", () => {
    writeFileSync(configPath, "{not json")
    const result = executeInstallServerConfig({ confirm: true, configPath })
    expect(result.ok).toBe(false)
    if (result.ok) throw new Error("expected not ok")
    expect(result.status).toBe("read-error")
    expect(readFileSync(configPath, "utf-8")).toBe("{not json")
  })

  test("plan-error on non-numeric existing server.port: file untouched", () => {
    // E.g. user hand-edited port: "auto" — we refuse to overwrite
    // blindly because we don't know what they meant.
    writeFileSync(configPath, JSON.stringify({ server: { port: "auto" } }))
    const before = readFileSync(configPath, "utf-8")
    const result = executeInstallServerConfig({ confirm: true, configPath })
    expect(result.ok).toBe(false)
    if (result.ok) throw new Error("expected not ok")
    expect(result.status).toBe("plan-error")
    if (result.status !== "plan-error") throw new Error("status guard")
    expect(result.reason).toMatch(/not a number/)
    expect(readFileSync(configPath, "utf-8")).toBe(before)
  })
})

describe("formatInstallServerConfigResult", () => {
  const planAddServer = {
    action: { kind: "add-server" as const, port: 0 },
    before: {},
    after: { server: { port: 0 } },
    diff: "+ server: { port: 0 }",
  }
  const planOverwrite = {
    action: { kind: "overwrite-port" as const, previous: 4096, next: 0 },
    before: { server: { port: 4096 } },
    after: { server: { port: 0 } },
    diff: "~ server.port: 4096 → 0",
  }

  test("preview status mentions confirm: true and shows diff", () => {
    const text = formatInstallServerConfigResult({
      ok: true,
      status: "preview",
      plan: planAddServer,
      configPath: "/x/opencode.json",
    })
    expect(text).toContain("Preview")
    expect(text).toContain("confirm: true")
    expect(text).toContain("/x/opencode.json")
    expect(text).toContain("+ server")
  })

  test("preview overwrite-port also nudges user to pass overwrite: true with previous value", () => {
    const text = formatInstallServerConfigResult({
      ok: true,
      status: "preview",
      plan: planOverwrite,
      configPath: "/x/opencode.json",
    })
    expect(text).toContain("overwrite: true")
    expect(text).toContain("4096")
  })

  test("noop status confirms no change", () => {
    const text = formatInstallServerConfigResult({
      ok: true,
      status: "noop",
      plan: { ...planAddServer, action: { kind: "noop", reason: "port-already-matches" }, diff: "(no change — port=0)" },
      configPath: "/x/opencode.json",
    })
    expect(text).toContain("No change")
    expect(text).toContain("(no change — port=0)")
  })

  test("written status reminds user to restart", () => {
    const text = formatInstallServerConfigResult({
      ok: true,
      status: "written",
      plan: planAddServer,
      configPath: "/x/opencode.json",
    })
    expect(text).toContain("Wrote /x/opencode.json")
    expect(text).toMatch(/Restart opencode/)
  })

  test("needs-overwrite explains both the previous value and the required flag", () => {
    const text = formatInstallServerConfigResult({
      ok: false,
      status: "needs-overwrite",
      plan: planOverwrite,
      configPath: "/x/opencode.json",
    })
    expect(text).toContain("Refusing to overwrite")
    expect(text).toContain("4096")
    expect(text).toContain("overwrite: true")
  })

  test("invalid-port surfaces the reason verbatim", () => {
    const text = formatInstallServerConfigResult({
      ok: false,
      status: "invalid-port",
      reason: "port must be an integer in [0, 65535] (got -1).",
    })
    expect(text).toContain("port must be an integer")
  })

  test("read-error surfaces the path and reason", () => {
    const text = formatInstallServerConfigResult({
      ok: false,
      status: "read-error",
      reason: "ENOENT",
      configPath: "/x/opencode.json",
    })
    expect(text).toContain("/x/opencode.json")
    expect(text).toContain("ENOENT")
  })
})
