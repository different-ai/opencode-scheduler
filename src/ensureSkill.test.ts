import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync, mkdirSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

import { ensureBestPracticesSkill } from "./index"

const SKILL_RELATIVE = ".opencode/skill/scheduled-job-best-practices/SKILL.md"

describe("ensureBestPracticesSkill", () => {
  let workdir: string

  beforeEach(() => {
    workdir = mkdtempSync(join(tmpdir(), "scheduler-skill-"))
  })

  afterEach(() => {
    rmSync(workdir, { recursive: true, force: true })
  })

  test("installs the skill on first use", () => {
    const result = ensureBestPracticesSkill(workdir)
    expect(result.status).toBe("installed")
    expect(result.path).toBe(join(workdir, SKILL_RELATIVE))
    expect(existsSync(result.path)).toBe(true)
    expect(readFileSync(result.path, "utf-8")).toContain("scheduled-job-best-practices")
  })

  test("leaves an existing SKILL.md untouched (no overwrite of user edits)", () => {
    const target = join(workdir, SKILL_RELATIVE)
    mkdirSync(join(workdir, ".opencode/skill/scheduled-job-best-practices"), { recursive: true })
    const userContent = "# my locally edited skill\n"
    writeFileSync(target, userContent)

    const result = ensureBestPracticesSkill(workdir)
    expect(result.status).toBe("present")
    expect(readFileSync(target, "utf-8")).toBe(userContent)
  })

  test("returns 'failed' with a reason when workdir does not exist", () => {
    const missing = join(workdir, "does-not-exist")
    const result = ensureBestPracticesSkill(missing)
    expect(result.status).toBe("failed")
    expect(result.reason).toMatch(/Directory not found/)
  })
})
