import { describe, expect, test } from "bun:test"
import { resolvePerlPath } from "../src/index"

const noPerl = () => null
const noFiles = () => false

describe("resolvePerlPath", () => {
  test("prefers an explicit override over everything else", () => {
    expect(
      resolvePerlPath({
        override: " /custom/bin/perl ",
        whichPerl: () => "/usr/bin/perl",
        fileExists: () => true,
      })
    ).toBe("/custom/bin/perl")
  })

  test("ignores a blank override", () => {
    expect(
      resolvePerlPath({
        override: "   ",
        whichPerl: () => "/usr/bin/perl",
        fileExists: noFiles,
      })
    ).toBe("/usr/bin/perl")
  })

  test("uses the PATH lookup before well-known locations", () => {
    expect(
      resolvePerlPath({
        whichPerl: () => "/opt/custom/perl",
        fileExists: () => true,
      })
    ).toBe("/opt/custom/perl")
  })

  test("falls back to well-known locations in order", () => {
    expect(
      resolvePerlPath({
        whichPerl: noPerl,
        fileExists: (path) => path === "/usr/local/bin/perl" || path === "/opt/homebrew/bin/perl",
      })
    ).toBe("/usr/local/bin/perl")
  })

  test("throws an actionable error when perl is missing", () => {
    expect(() => resolvePerlPath({ whichPerl: noPerl, fileExists: noFiles })).toThrow(/apk add perl/)
    expect(() => resolvePerlPath({ whichPerl: noPerl, fileExists: noFiles })).toThrow(
      /OPENCODE_SCHEDULER_PERL_PATH/
    )
  })
})
