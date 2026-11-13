// Checks the plugin's two entrypoints against stand-in OpenCode hosts.
//
// The plugin writes job files under ~/.config/opencode and registers jobs with the OS scheduler.
// run.sh points HOME at a temporary directory and puts stand-in scheduler commands first on PATH,
// and this file refuses to start unless that is in place.
import { expect, setDefaultTimeout, test } from "bun:test"
import { execFileSync } from "child_process"
import { existsSync, readFileSync } from "fs"
import { join } from "path"

// Each tool call starts a few short-lived processes (`command -v`, `--version`, the scheduler).
setDefaultTimeout(60_000)

const home = process.env.HOME ?? ""
const sandbox = process.env.SCHEDULER_TEST_SANDBOX ?? ""
if (!sandbox || home !== join(sandbox, "home")) {
  throw new Error("Run these tests with `bun run test`; they must not run against your real home directory.")
}

const projectA = join(home, "project-a")
const projectB = join(home, "project-b")
const scopes = join(home, ".config", "opencode", "scheduler", "scopes")
const jobFile = (scopeId: string, slug: string) => join(scopes, scopeId, "jobs", `${slug}.json`)
const readJob = (scopeId: string, slug: string) => JSON.parse(readFileSync(jobFile(scopeId, slug), "utf8"))

type Result = { success: boolean; output: string; data?: any }
type Tool2 = {
  name: string
  input: { type: string; required?: string[] }
  options: { codemode: boolean }
  execute(input: unknown, call: unknown): Promise<{ content: string }>
}

// A fresh module per host: one OpenCode process loads the plugin once, as either 1.x or 2.x.
async function load(tag: string) {
  return (await import(`../dist/index.js?${tag}`)).default
}

async function host2(tag: string) {
  const plugin = await load(tag)
  const tools = new Map<string, Tool2>()
  const directories: Record<string, string> = { a: projectA, b: projectB }
  await plugin.setup({
    location: { directory: join(home, "elsewhere") },
    session: { get: async ({ sessionID }: { sessionID: string }) => ({ location: { directory: directories[sessionID] } }) },
    tool: { transform: async (edit: (editor: { add(tool: Tool2): void }) => void) => edit({ add: (t) => tools.set(t.name, t) }) },
  })
  const call = async (name: string, input: Record<string, unknown>, sessionID = "a"): Promise<Result> => {
    const context = { sessionID, messageID: "m", agent: "build", signal: new AbortController().signal }
    return JSON.parse((await tools.get(name)!.execute({ ...input, format: "json" }, context)).content)
  }
  return { plugin, tools, call }
}

// A job runs `<binary> run ...`, behind `/usr/bin/env NAME=value ...` when it carries XDG directories.
function command(invocation: { command: string; args: string[] }) {
  if (invocation.command !== "/usr/bin/env") return { binary: invocation.command, args: invocation.args }
  const start = invocation.args.findIndex((arg) => !arg.includes("="))
  return { binary: invocation.args[start], args: invocation.args.slice(start + 1) }
}

test("OpenCode 2: registers every tool with a JSON Schema input", async () => {
  const { plugin, tools } = await host2("register")
  expect(plugin.id).toBe("opencode-scheduler")
  expect([...tools.keys()].sort()).toEqual([
    "cleanup_global", "delete_job", "get_job", "get_skill", "get_version", "install_skill",
    "job_logs", "list_jobs", "run_job", "schedule_job", "update_job",
  ])
  const schedule = tools.get("schedule_job")!
  expect(schedule.input.type).toBe("object")
  expect(schedule.input.required).toEqual(expect.arrayContaining(["name", "schedule"]))
  expect(schedule.options.codemode).toBe(false)
})

test("OpenCode 2: builds `opencode run` flags that 2.x accepts", async () => {
  const { call } = await host2("flags")
  const result = await call("schedule_job", {
    name: "flags", schedule: "0 3 * * *", prompt: "do it", model: "p/m", variant: "high",
    agent: "plan", title: "T", files: "a.txt, b.txt", attachUrl: "http://127.0.0.1:4096",
  })
  expect(result.success).toBe(true)
  const job = readJob(result.data.job.scopeId, "flags")
  expect(command(job.invocation).args).toEqual([
    "run", "--server", "http://127.0.0.1:4096", "--agent", "plan", "--model", "p/m#high",
    "--title", "T", "--file", "a.txt", "--file", "b.txt", "--", "do it",
  ])
})

test("OpenCode 2: runs jobs with a 2.x binary and the XDG directories it was started with", async () => {
  const { call } = await host2("binary")
  const result = await call("schedule_job", { name: "binary", schedule: "0 3 * * *", prompt: "x" })
  const { invocation } = readJob(result.data.job.scopeId, "binary")
  // run.sh puts a 1.x `opencode` ahead of a 2.x `opencode2` on PATH. The plugin also searches the
  // usual install directories, so check what the chosen binary reports, not where it is.
  const { binary } = command(invocation)
  expect(execFileSync(binary, ["--version"], { encoding: "utf8" })).toMatch(/(^|\D)2\.\d+\.\d+/)
  expect(invocation.command).toBe("/usr/bin/env")
  expect(invocation.args).toContain(`XDG_DATA_HOME=${join(sandbox, "xdg-data")}`)
})

test("OpenCode 2: rejects fields `opencode run` no longer has, and saves nothing", async () => {
  const { call } = await host2("reject")
  const base = { schedule: "0 3 * * *" }
  for (const [field, input] of [
    ["command", { command: "review" }],
    ["port", { prompt: "x", port: 4096 }],
    ["share", { prompt: "x", share: true }],
  ] as const) {
    const result = await call("schedule_job", { name: `no-${field}`, ...base, ...input })
    expect(result.success).toBe(false)
    expect(result.output).toContain("OpenCode 2")
    expect(result.output).toContain(field)
  }
  expect((await call("schedule_job", { name: "no-model", ...base, prompt: "x", variant: "high" })).output).toContain("variant needs model")
  expect((await call("schedule_job", { name: "two-variants", ...base, prompt: "x", model: "p/m#low", variant: "high" })).output).toContain("already names a variant")
  const saved = ((await call("list_jobs", { allScopes: true })).data?.jobs ?? []).map((job: { slug: string }) => job.slug)
  expect(saved.filter((slug: string) => slug.startsWith("no-") || slug === "two-variants")).toEqual([])
})

test("OpenCode 2: a job belongs to the project of the session that scheduled it", async () => {
  const { call } = await host2("scope")
  const created = await call("schedule_job", { name: "scoped", schedule: "0 3 * * *", prompt: "x" }, "a")
  expect(created.data.job.workdir).toBe(projectA)
  const slugs = (result: Result) => (result.data?.jobs ?? []).map((job: { slug: string }) => job.slug)
  expect(slugs(await call("list_jobs", {}, "a"))).toContain("scoped")
  expect(slugs(await call("list_jobs", {}, "b"))).toEqual([])
  expect(slugs(await call("list_jobs", { allScopes: true }, "b"))).toContain("scoped")
  expect((await call("get_job", { name: "scoped" }, "b")).success).toBe(false)

  const installed = await call("install_skill", {}, "b")
  expect(installed.data.installed.directory.startsWith(projectB)).toBe(true)
})

test("OpenCode 2: update_job rebuilds the stored command line, and delete_job removes the job", async () => {
  const { call } = await host2("update")
  const created = await call("schedule_job", { name: "edit", schedule: "0 3 * * *", prompt: "x", model: "p/m" })
  const scopeId = created.data.job.scopeId

  expect((await call("update_job", { name: "edit", schedule: "30 4 * * *", model: "p/other" })).success).toBe(true)
  const job = readJob(scopeId, "edit")
  expect(job.schedule).toBe("30 4 * * *")
  expect(command(job.invocation).args).toContain("p/other")

  expect((await call("update_job", { name: "edit", share: true })).success).toBe(false)
  expect((await call("job_logs", { name: "edit" })).success).toBe(true)
  expect((await call("cleanup_global", {})).data.dryRun).toBe(true)
  expect((await call("delete_job", { name: "edit" })).success).toBe(true)
  expect(existsSync(jobFile(scopeId, "edit"))).toBe(false)
})

test("OpenCode 2: input that does not match the schema is rejected before the tool runs", async () => {
  const { tools } = await host2("invalid")
  const context = { sessionID: "a", messageID: "m", agent: "build", signal: new AbortController().signal }
  await expect(tools.get("schedule_job")!.execute({ schedule: "0 3 * * *" }, context)).rejects.toThrow()
})

test("OpenCode 1: the 1.x entrypoint keeps 1.x flags, even after 1.19 also calls setup", async () => {
  const plugin = await load("v1")
  // OpenCode 1.19 calls setup with a context that has no tool or session API.
  await plugin.setup({ options: {}, agent: {}, command: {}, plugin: {} })
  const hooks = await plugin.server({})
  expect(Object.keys(hooks.tool)).toHaveLength(11)

  const run = async (input: Record<string, unknown>): Promise<Result> =>
    JSON.parse(await hooks.tool.schedule_job.execute({ schedule: "0 3 * * *", format: "json", ...input }, {}))

  const withVariant = await run({ name: "v1 variant", prompt: "x", model: "p/m", variant: "high" })
  expect(withVariant.data.job.invocation.args).toEqual(["run", "--model", "p/m", "--variant", "high", "--", "x"])

  const withCommand = await run({ name: "v1 command", command: "review", port: 4096, share: true })
  expect(withCommand.success).toBe(true)
  expect(withCommand.data.job.invocation.args).toEqual(["run", "--port", "4096", "--command", "review", "--share", "--", ""])
  expect(withCommand.data.job.invocation.command).not.toBe("/usr/bin/env")
})
