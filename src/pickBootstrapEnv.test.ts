import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { pickBootstrapEnv } from "./index"

const TERMINAL_PATH = "/Users/x/.nvm/versions/node/v22/bin:/usr/local/bin:/usr/bin:/bin"

type AnyJob = Parameters<typeof pickBootstrapEnv>[0]

function makeJob(snapshot?: Record<string, string>): AnyJob {
  const base = {
    scopeId: "test",
    slug: "test",
    name: "Test",
    schedule: "0 9 * * *",
    createdAt: new Date().toISOString(),
  }
  if (!snapshot) return base as AnyJob
  return { ...base, env: { mode: "snapshot", snapshot } } as AnyJob
}

describe("pickBootstrapEnv", () => {
  let originalEnv: NodeJS.ProcessEnv

  beforeEach(() => {
    originalEnv = { ...process.env }
  })

  afterEach(() => {
    for (const key of Object.keys(process.env)) delete process.env[key]
    Object.assign(process.env, originalEnv)
  })

  test("emits exactly the bootstrap keys, no more", () => {
    const job = makeJob({
      PATH: "ignored", // overridden by terminalPath arg
      HOME: "/Users/test",
      USER: "test",
      SHELL: "/bin/bash",
      OPENCODE_API_KEY: "secret",
      MY_MCP_TOKEN: "tok",
      RANDOM_VAR: "x",
    })
    const env = pickBootstrapEnv(job, TERMINAL_PATH)
    expect(Object.keys(env).sort()).toEqual(["HOME", "PATH", "SHELL", "USER"])
    expect(env.OPENCODE_API_KEY).toBeUndefined()
    expect(env.MY_MCP_TOKEN).toBeUndefined()
  })

  test("PATH always wins from terminalPath argument", () => {
    const job = makeJob({ PATH: "/some/old/path", HOME: "/h", USER: "u", SHELL: "/bin/zsh" })
    const env = pickBootstrapEnv(job, TERMINAL_PATH)
    expect(env.PATH).toBe(TERMINAL_PATH)
  })

  test("falls back to process.env when snapshot missing keys", () => {
    process.env.HOME = "/Users/proc"
    process.env.USER = "proc"
    process.env.SHELL = "/bin/bash"
    const job = makeJob() // no env field at all (legacy)
    const env = pickBootstrapEnv(job, TERMINAL_PATH)
    expect(env.HOME).toBe("/Users/proc")
    expect(env.USER).toBe("proc")
    expect(env.SHELL).toBe("/bin/bash")
    expect(env.PATH).toBe(TERMINAL_PATH)
  })

  test("snapshot wins over process.env for non-PATH keys", () => {
    process.env.HOME = "/Users/proc"
    process.env.SHELL = "/bin/zsh"
    const job = makeJob({ HOME: "/Users/snap", USER: "snap", SHELL: "/bin/bash" })
    const env = pickBootstrapEnv(job, TERMINAL_PATH)
    expect(env.HOME).toBe("/Users/snap")
    expect(env.SHELL).toBe("/bin/bash")
  })

  test("omits keys missing in both snapshot and process.env", () => {
    delete process.env.USER
    delete process.env.HOME
    delete process.env.SHELL
    const job = makeJob() // legacy
    const env = pickBootstrapEnv(job, TERMINAL_PATH)
    // PATH always present (terminalPath); other three may be missing
    expect(env.PATH).toBe(TERMINAL_PATH)
    expect(env.USER).toBeUndefined()
    expect(env.HOME).toBeUndefined()
    expect(env.SHELL).toBeUndefined()
  })

  test("rendered output stays small even with massive snapshot (cron line-length)", () => {
    const big: Record<string, string> = { HOME: "/h", USER: "u", SHELL: "/bin/bash" }
    for (let i = 0; i < 200; i += 1) {
      big[`VAR_${i}`] = `value_${i}_with_some_padding_to_simulate_real_secret_lengths`
    }
    const job = makeJob(big)
    const env = pickBootstrapEnv(job, TERMINAL_PATH)
    expect(Object.keys(env).length).toBe(4) // PATH, HOME, USER, SHELL only
  })

  test("secrets in snapshot do NOT leak into bootstrap render output", () => {
    const job = makeJob({
      HOME: "/h",
      USER: "u",
      SHELL: "/bin/bash",
      OPENCODE_API_KEY: "sk-secret",
      MY_MCP_TOKEN: "tok-secret",
      AWS_SECRET_ACCESS_KEY: "aws-secret",
    })
    const env = pickBootstrapEnv(job, TERMINAL_PATH)
    const serialized = JSON.stringify(env)
    expect(serialized).not.toContain("sk-secret")
    expect(serialized).not.toContain("tok-secret")
    expect(serialized).not.toContain("aws-secret")
  })
})
