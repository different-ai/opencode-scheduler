import { describe, expect, test } from "bun:test"
import {
  buildInternalServerWarning,
  createSchedulerSessionWithClient,
  formatScheduleJobSuccess,
  getEffectiveSessionPolicy,
  isInternalServerUrl,
  parseDeliveryPolicy,
  parseExecutionPolicy,
  parseSessionPolicy,
  resolveEffectiveAttachUrl,
  validateSessionPolicyArgs,
} from "./index"
import type { ScheduledPermissionRule, SchedulerSessionClient } from "./index"

describe("parseSessionPolicy (F1: strict, no default)", () => {
  test("throws when undefined or null — agent must elicit explicitly", () => {
    expect(() => parseSessionPolicy(undefined)).toThrow(/sessionPolicy is required/)
    expect(() => parseSessionPolicy(null)).toThrow(/sessionPolicy is required/)
  })

  test("throws on empty / whitespace string — also missing", () => {
    expect(() => parseSessionPolicy("")).toThrow(/sessionPolicy is required/)
    expect(() => parseSessionPolicy("  ")).toThrow(/sessionPolicy is required/)
  })

  test("error message lists all four options to help the agent ask the user", () => {
    try {
      parseSessionPolicy(undefined)
      throw new Error("expected throw")
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      expect(msg).toContain("'current'")
      expect(msg).toContain("'existing'")
      expect(msg).toContain("'new-per-job'")
      expect(msg).toContain("'new-per-run'")
    }
  })

  test("accepts all four valid values", () => {
    expect(parseSessionPolicy("current")).toBe("current")
    expect(parseSessionPolicy("existing")).toBe("existing")
    expect(parseSessionPolicy("new-per-job")).toBe("new-per-job")
    expect(parseSessionPolicy("new-per-run")).toBe("new-per-run")
  })

  test("rejects unknown values", () => {
    expect(() => parseSessionPolicy("nonsense")).toThrow(/Invalid sessionPolicy/)
    expect(() => parseSessionPolicy("Current")).toThrow(/Invalid sessionPolicy/)
  })

  test("rejects non-string types", () => {
    expect(() => parseSessionPolicy(42)).toThrow(/sessionPolicy must be a string/)
    expect(() => parseSessionPolicy({})).toThrow(/sessionPolicy must be a string/)
  })
})

describe("getEffectiveSessionPolicy (F1 back-compat for persisted job.json)", () => {
  test("returns sessionPolicy when present", () => {
    expect(getEffectiveSessionPolicy({ sessionPolicy: "new-per-job" })).toBe("new-per-job")
    expect(getEffectiveSessionPolicy({ sessionPolicy: "existing" })).toBe("existing")
  })

  test("falls back to 'current' for legacy job.json without sessionPolicy", () => {
    // Pre-F1 jobs were always implicitly 'current'; preserve that
    // semantics so old jobs keep working at fire-time.
    expect(getEffectiveSessionPolicy({})).toBe("current")
    expect(getEffectiveSessionPolicy({ sessionPolicy: undefined })).toBe("current")
  })
})

describe("isInternalServerUrl (F2a sentinel detection)", () => {
  test("recognizes the in-process IPC sentinel hostname", () => {
    expect(isInternalServerUrl("http://opencode.internal/")).toBe(true)
    expect(isInternalServerUrl("http://opencode.internal/global/health")).toBe(true)
    expect(isInternalServerUrl(new URL("http://opencode.internal/session"))).toBe(true)
  })

  test("treats real loopback / hostnames as external", () => {
    expect(isInternalServerUrl("http://127.0.0.1:4096/")).toBe(false)
    expect(isInternalServerUrl("http://localhost:4096/")).toBe(false)
    expect(isInternalServerUrl("https://opencode.example.com/")).toBe(false)
  })

  test("returns false on garbage input rather than throwing", () => {
    expect(isInternalServerUrl("not-a-url")).toBe(false)
    expect(isInternalServerUrl("")).toBe(false)
  })
})

describe("resolveEffectiveAttachUrl (F2a + F2b)", () => {
  const externalUrl = "http://127.0.0.1:4096"
  const internalUrl = "http://opencode.internal/"

  test("explicit attachUrl wins — no auto-promote, no warning, even with internal serverUrl", () => {
    const result = resolveEffectiveAttachUrl({
      argAttachUrl: "http://example.com:5000",
      serverUrl: internalUrl,
      sessionPolicy: "current",
      executionPolicy: "prefer-live-server",
    })
    expect(result.attachUrl).toBe("http://example.com:5000")
    expect(result.autoFromServerUrl).toBe(false)
    expect(result.internalWarning).toBe(false)
  })

  test("F2b: external serverUrl + no arg → auto-promote, log it", () => {
    const result = resolveEffectiveAttachUrl({
      serverUrl: externalUrl,
      sessionPolicy: "current",
      executionPolicy: "prefer-live-server",
    })
    expect(result.attachUrl).toBe(externalUrl)
    expect(result.autoFromServerUrl).toBe(true)
    expect(result.internalWarning).toBe(false)
  })

  test("F2b: auto-promote works for every sessionPolicy when serverUrl is external", () => {
    for (const sessionPolicy of ["current", "existing", "new-per-job", "new-per-run"] as const) {
      const result = resolveEffectiveAttachUrl({
        serverUrl: externalUrl,
        sessionPolicy,
        executionPolicy: "prefer-live-server",
      })
      expect(result.attachUrl).toBe(externalUrl)
      expect(result.autoFromServerUrl).toBe(true)
    }
  })

  test("F2a: internal serverUrl + current → warning, attachUrl undefined", () => {
    const result = resolveEffectiveAttachUrl({
      serverUrl: internalUrl,
      sessionPolicy: "current",
      executionPolicy: "prefer-live-server",
    })
    expect(result.attachUrl).toBeUndefined()
    expect(result.autoFromServerUrl).toBe(false)
    expect(result.internalWarning).toBe(true)
  })

  test("F2a: internal serverUrl + existing → also warns", () => {
    const result = resolveEffectiveAttachUrl({
      serverUrl: internalUrl,
      sessionPolicy: "existing",
      executionPolicy: "prefer-live-server",
    })
    expect(result.internalWarning).toBe(true)
  })

  test("F2a: internal serverUrl + new-per-job → no warning (new session, not user's TUI)", () => {
    const result = resolveEffectiveAttachUrl({
      serverUrl: internalUrl,
      sessionPolicy: "new-per-job",
      executionPolicy: "prefer-live-server",
    })
    expect(result.internalWarning).toBe(false)
  })

  test("F2a: internal serverUrl + new-per-run → no warning either", () => {
    const result = resolveEffectiveAttachUrl({
      serverUrl: internalUrl,
      sessionPolicy: "new-per-run",
      executionPolicy: "prefer-live-server",
    })
    expect(result.internalWarning).toBe(false)
  })

  test("headless-only suppresses F2b auto-promote even for external serverUrl", () => {
    const result = resolveEffectiveAttachUrl({
      serverUrl: externalUrl,
      sessionPolicy: "current",
      executionPolicy: "headless-only",
    })
    expect(result.attachUrl).toBeUndefined()
    expect(result.autoFromServerUrl).toBe(false)
  })

  test("headless-only suppresses F2a warning too — user explicitly opted out of live", () => {
    const result = resolveEffectiveAttachUrl({
      serverUrl: internalUrl,
      sessionPolicy: "current",
      executionPolicy: "headless-only",
    })
    expect(result.attachUrl).toBeUndefined()
    expect(result.internalWarning).toBe(false)
  })

  test("explicit empty-string arg is treated as missing, F2b still kicks in", () => {
    const result = resolveEffectiveAttachUrl({
      argAttachUrl: "",
      serverUrl: externalUrl,
      sessionPolicy: "current",
      executionPolicy: "prefer-live-server",
    })
    expect(result.attachUrl).toBe(externalUrl)
    expect(result.autoFromServerUrl).toBe(true)
  })
})

describe("buildInternalServerWarning", () => {
  test("mentions both --port 0 and the upstream config option so the user knows the fix path", () => {
    const warning = buildInternalServerWarning()
    expect(warning).toMatch(/--port 0/)
    expect(warning).toMatch(/server\.port: 0/)
    expect(warning).toMatch(/opencode\.internal/)
  })
})

describe("formatScheduleJobSuccess (F1+F2 success-output integration)", () => {
  const baseInput = {
    name: "verify-no-show",
    schedule: "*/2 * * * *",
    scheduleHuman: "Every 2 minutes",
    platformName: "launchd",
    workdir: "/Users/me/proj",
    primaryLine: "Prompt: ping",
    skillEnsure: { status: "present", path: "/Users/me/proj/.opencode/skill/x" } as const,
    reliabilityLine: "The job will run at the scheduled time.",
  }

  test("F2a: silent-no-show case — internalWarning=true → warning block in output", () => {
    // Reproduces the exact "Status: success but TUI never refreshed"
    // case from the EXECUTION LOG: serverUrl is internal,
    // sessionPolicy='current', no attachUrl. The success output MUST
    // include the warning so the user knows live delivery is impossible.
    const out = formatScheduleJobSuccess({
      ...baseInput,
      attachUrl: undefined,
      attachUrlAutoFromServerUrl: false,
      internalWarning: true,
    })
    expect(out).toContain("WARNING:")
    expect(out).toContain("opencode.internal")
    expect(out).toContain("--port 0")
    // No Attach URL line when there is no attachUrl.
    expect(out).not.toMatch(/^Attach URL:/m)
  })

  test("F2a: no warning when internalWarning=false (live delivery possible)", () => {
    const out = formatScheduleJobSuccess({
      ...baseInput,
      attachUrl: "http://127.0.0.1:4096",
      attachUrlAutoFromServerUrl: false,
      internalWarning: false,
    })
    expect(out).not.toContain("WARNING:")
  })

  test("F2b: auto-detected attachUrl shows the audit annotation", () => {
    const out = formatScheduleJobSuccess({
      ...baseInput,
      attachUrl: "http://127.0.0.1:4096",
      attachUrlAutoFromServerUrl: true,
      internalWarning: false,
    })
    expect(out).toContain("Attach URL: http://127.0.0.1:4096")
    expect(out).toContain("auto-detected from this opencode's serverUrl")
  })

  test("F2b: explicit attachUrl shows no annotation", () => {
    const out = formatScheduleJobSuccess({
      ...baseInput,
      attachUrl: "http://example.com:5000",
      attachUrlAutoFromServerUrl: false,
      internalWarning: false,
    })
    expect(out).toContain("Attach URL: http://example.com:5000")
    expect(out).not.toContain("auto-detected")
  })

  test("layout invariants stay intact", () => {
    const out = formatScheduleJobSuccess({
      ...baseInput,
      attachUrl: undefined,
      attachUrlAutoFromServerUrl: false,
      internalWarning: false,
    })
    expect(out).toContain('Scheduled "verify-no-show"')
    expect(out).toContain("Schedule: */2 * * * * (Every 2 minutes)")
    expect(out).toContain("Platform: launchd")
    expect(out).toContain("Working Directory: /Users/me/proj")
    expect(out).toContain("Prompt: ping")
    expect(out).toContain('"run verify-no-show now"')
  })

  test("F1+F2 combined: warning AND auto-detected lines never both apply (mutually exclusive states)", () => {
    // Sanity: this combination is not produced by the real runtime
    // (resolveEffectiveAttachUrl would return either internalWarning:true
    // OR autoFromServerUrl:true, never both), but the formatter still
    // tolerates being asked to render both, which would indicate a
    // logic regression in the resolver. Document the formatter's
    // behavior so a future bug-bisect is simpler.
    const out = formatScheduleJobSuccess({
      ...baseInput,
      attachUrl: "http://127.0.0.1:4096",
      attachUrlAutoFromServerUrl: true,
      internalWarning: true,
    })
    expect(out).toContain("auto-detected")
    expect(out).toContain("WARNING:")
  })
})

describe("F1 contract: update_job sessionPolicy is NOT required", () => {
  // update_job's Zod schema in src/index.ts deliberately does not
  // declare a `sessionPolicy` arg, so calling update_job without one
  // is by construction the no-op the plan requires. This test guards
  // against a future drive-by addition that mirrors schedule_job's
  // required field on update_job too.
  test("parseSessionPolicy is the only path that enforces required — never called from update_job", async () => {
    const sourceText = await Bun.file(`${import.meta.dir}/index.ts`).text()
    // Find the update_job tool block.
    const updateJobIndex = sourceText.indexOf("update_job: tool({")
    expect(updateJobIndex).toBeGreaterThan(0)
    // Find where the next tool starts, so we only scan update_job's body.
    const afterUpdate = sourceText.slice(updateJobIndex)
    const nextToolIndex = afterUpdate.indexOf("tool({", "update_job: tool({".length)
    const updateJobBody = nextToolIndex > 0 ? afterUpdate.slice(0, nextToolIndex) : afterUpdate
    expect(updateJobBody).not.toContain("parseSessionPolicy")
    expect(updateJobBody).not.toMatch(/sessionPolicy:\s*tool\.schema/)
  })
})

describe("parseExecutionPolicy", () => {
  test("defaults to 'prefer-live-server'", () => {
    expect(parseExecutionPolicy(undefined)).toBe("prefer-live-server")
    expect(parseExecutionPolicy("")).toBe("prefer-live-server")
  })

  test("accepts both valid values", () => {
    expect(parseExecutionPolicy("prefer-live-server")).toBe("prefer-live-server")
    expect(parseExecutionPolicy("headless-only")).toBe("headless-only")
  })

  test("rejects unknown values", () => {
    expect(() => parseExecutionPolicy("live-only")).toThrow(/Invalid executionPolicy/)
  })
})

describe("parseDeliveryPolicy", () => {
  test("defaults to 'execute'", () => {
    expect(parseDeliveryPolicy(undefined)).toBe("execute")
    expect(parseDeliveryPolicy("")).toBe("execute")
  })

  test("accepts both valid values", () => {
    expect(parseDeliveryPolicy("execute")).toBe("execute")
    expect(parseDeliveryPolicy("leave-message")).toBe("leave-message")
  })

  test("rejects unknown values", () => {
    expect(() => parseDeliveryPolicy("queue")).toThrow(/Invalid deliveryPolicy/)
  })
})

describe("validateSessionPolicyArgs", () => {
  const baseArgs = {
    sessionPolicy: "current" as const,
    executionPolicy: "prefer-live-server" as const,
    deliveryPolicy: "execute" as const,
  }

  test("current: ok when toolSessionID present", () => {
    const err = validateSessionPolicyArgs({ ...baseArgs, toolSessionID: "ses_abc" })
    expect(err).toBeUndefined()
  })

  test("current: ok when sessionId arg present", () => {
    const err = validateSessionPolicyArgs({ ...baseArgs, sessionId: "ses_xyz" })
    expect(err).toBeUndefined()
  })

  test("current: error when both missing", () => {
    const err = validateSessionPolicyArgs({ ...baseArgs })
    expect(err).toMatch(/'current' requires a session context/)
  })

  test("existing: requires sessionId", () => {
    const err = validateSessionPolicyArgs({
      ...baseArgs,
      sessionPolicy: "existing",
      toolSessionID: "ses_abc", // ignored for existing
    })
    expect(err).toMatch(/'existing' requires sessionId/)
  })

  test("existing: ok with sessionId", () => {
    const err = validateSessionPolicyArgs({
      ...baseArgs,
      sessionPolicy: "existing",
      sessionId: "ses_xyz",
    })
    expect(err).toBeUndefined()
  })

  test("new-per-job: no sessionId required at args level", () => {
    const err = validateSessionPolicyArgs({ ...baseArgs, sessionPolicy: "new-per-job" })
    expect(err).toBeUndefined()
  })

  test("new-per-run: no sessionId required at args level", () => {
    const err = validateSessionPolicyArgs({ ...baseArgs, sessionPolicy: "new-per-run" })
    expect(err).toBeUndefined()
  })

  test("headless-only forbids attachUrl", () => {
    const err = validateSessionPolicyArgs({
      ...baseArgs,
      executionPolicy: "headless-only",
      sessionId: "ses_abc",
      attachUrl: "http://localhost:4096",
    })
    expect(err).toMatch(/'headless-only' is incompatible with attachUrl/)
  })

  test("headless-only without attachUrl is fine", () => {
    const err = validateSessionPolicyArgs({
      ...baseArgs,
      executionPolicy: "headless-only",
      toolSessionID: "ses_abc",
    })
    expect(err).toBeUndefined()
  })

  test("leave-message + headless-only: not a hard error (warning case)", () => {
    const err = validateSessionPolicyArgs({
      ...baseArgs,
      executionPolicy: "headless-only",
      deliveryPolicy: "leave-message",
      toolSessionID: "ses_abc",
    })
    expect(err).toBeUndefined()
  })
})

describe("createSchedulerSessionWithClient", () => {
  const scheduledPermissions: readonly ScheduledPermissionRule[] = [
    { permission: "question", action: "deny", pattern: "*" },
    { permission: "plan_enter", action: "deny", pattern: "*" },
    { permission: "plan_exit", action: "deny", pattern: "*" },
  ]

  test("creates the session through the plugin client with permissions", async () => {
    let capturedBody = ""
    const client: SchedulerSessionClient = {
      session: {
        async create(options) {
          capturedBody = JSON.stringify(options.body)
          return { data: { id: "ses_scheduler" } }
        },
      },
    }

    const sessionId = await createSchedulerSessionWithClient({
      client,
      title: "verify-v0",
      permission: scheduledPermissions,
    })

    expect(sessionId).toBe("ses_scheduler")
    expect(capturedBody).toContain('"title":"verify-v0"')
    expect(capturedBody).toContain('"permission"')
    expect(capturedBody).toContain('"plan_enter"')
  })

  test("reports client creation failures", async () => {
    const client: SchedulerSessionClient = {
      session: {
        async create() {
          return { error: { message: "boom" } }
        },
      },
    }

    await expect(
      createSchedulerSessionWithClient({
        client,
        title: "verify-v0",
        permission: scheduledPermissions,
      })
    ).rejects.toThrow(/client\.session\.create failed: boom/)
  })

  test("throws when the client returns data without an id", async () => {
    const client: SchedulerSessionClient = {
      session: {
        async create() {
          return { data: {} }
        },
      },
    }

    await expect(
      createSchedulerSessionWithClient({
        client,
        title: "verify-v0",
        permission: scheduledPermissions,
      })
    ).rejects.toThrow(/no id/)
  })
})
