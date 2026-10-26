import { describe, expect, test } from "bun:test"
import { isMissingCrontabError } from "../src/index"

describe("isMissingCrontabError", () => {
  test.each([
    ["vixie/cronie", "no crontab for root"],
    ["busybox (Alpine)", "crontab: can't open 'opencode': No such file or directory"],
    ["empty stderr", ""],
  ])("treats %s output as an empty crontab", (_label, stderr) => {
    expect(isMissingCrontabError(1, stderr)).toBe(true)
  })

  test("does not swallow permission errors", () => {
    expect(isMissingCrontabError(1, "crontab: can't open 'root': Permission denied")).toBe(false)
  })

  test("does not swallow unexpected exit codes", () => {
    expect(isMissingCrontabError(2, "no crontab for root")).toBe(false)
    expect(isMissingCrontabError(undefined, "no crontab for root")).toBe(false)
  })
})
