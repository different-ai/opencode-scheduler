import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { captureJobEnv } from "./index"

describe("captureJobEnv", () => {
  let originalEnv: NodeJS.ProcessEnv

  beforeEach(() => {
    originalEnv = { ...process.env }
  })

  afterEach(() => {
    for (const key of Object.keys(process.env)) {
      delete process.env[key]
    }
    Object.assign(process.env, originalEnv)
  })

  test("default mode='snapshot' captures full process.env minus denylist", () => {
    process.env.OPENCODE_API_KEY = "secret-key"
    process.env.MY_MCP_TOKEN = "tok123"
    process.env.OPENCODE_PERMISSION = '{"question":"deny"}'
    process.env.OPENCODE_SCHEDULER_RUN_ID = "abc-123"
    process.env.PWD = "/tmp/foo"
    process.env._ = "/usr/local/bin/bun"

    const env = captureJobEnv()

    expect(env.mode).toBe("snapshot")
    expect(env.snapshot?.OPENCODE_API_KEY).toBe("secret-key")
    expect(env.snapshot?.MY_MCP_TOKEN).toBe("tok123")
    // denylist
    expect(env.snapshot?.OPENCODE_PERMISSION).toBeUndefined()
    expect(env.snapshot?.OPENCODE_SCHEDULER_RUN_ID).toBeUndefined()
    expect(env.snapshot?.PWD).toBeUndefined()
    expect(env.snapshot?._).toBeUndefined()
  })

  test("mode='minimal' captures only PATH/HOME/USER/SHELL", () => {
    process.env.OPENCODE_API_KEY = "secret-key"
    process.env.MY_MCP_TOKEN = "tok123"
    process.env.HOME = "/Users/test"
    process.env.USER = "test"
    process.env.SHELL = "/bin/zsh"

    const env = captureJobEnv({ mode: "minimal" })

    expect(env.mode).toBe("minimal")
    expect(env.snapshot?.HOME).toBe("/Users/test")
    expect(env.snapshot?.USER).toBe("test")
    expect(env.snapshot?.SHELL).toBe("/bin/zsh")
    expect(env.snapshot?.PATH).toBeDefined() // either from process.env or fallback
    expect(env.snapshot?.OPENCODE_API_KEY).toBeUndefined()
    expect(env.snapshot?.MY_MCP_TOKEN).toBeUndefined()
  })

  test("exclude extends the denylist", () => {
    process.env.MY_MCP_TOKEN = "tok123"
    process.env.OTHER_VAR = "keep"

    const env = captureJobEnv({ exclude: ["MY_MCP_TOKEN"] })

    expect(env.snapshot?.MY_MCP_TOKEN).toBeUndefined()
    expect(env.snapshot?.OTHER_VAR).toBe("keep")
  })

  test("set overrides applied last; can introduce new keys", () => {
    process.env.EXISTING = "old"

    const env = captureJobEnv({ set: { EXISTING: "new", NEW_KEY: "value" } })

    expect(env.snapshot?.EXISTING).toBe("new")
    expect(env.snapshot?.NEW_KEY).toBe("value")
  })

  test("set cannot override denylist keys", () => {
    const env = captureJobEnv({ set: { OPENCODE_PERMISSION: "should-be-rejected" } })
    expect(env.snapshot?.OPENCODE_PERMISSION).toBeUndefined()
  })

  test("PATH is always present even when mode='minimal' and process.env.PATH missing", () => {
    delete process.env.PATH

    const env = captureJobEnv({ mode: "minimal" })

    expect(env.snapshot?.PATH).toBeDefined()
    expect(env.snapshot?.PATH?.length).toBeGreaterThan(0)
  })

  test("login-shell mode behaves like snapshot for env capture (wrap is invocation-time)", () => {
    process.env.MY_KEY = "value"
    const env = captureJobEnv({ mode: "login-shell" })

    expect(env.mode).toBe("login-shell")
    expect(env.snapshot?.MY_KEY).toBe("value")
  })
})
