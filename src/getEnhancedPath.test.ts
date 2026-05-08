import { afterEach, beforeEach, describe, expect, test } from "bun:test"
import { getEnhancedPath } from "./index"

const FALLBACK = ["/opt/homebrew/bin", "/usr/local/bin", "/usr/bin", "/bin", "/usr/sbin", "/sbin"]

describe("getEnhancedPath", () => {
  let originalPath: string | undefined

  beforeEach(() => {
    originalPath = process.env.PATH
  })

  afterEach(() => {
    if (originalPath === undefined) {
      delete process.env.PATH
    } else {
      process.env.PATH = originalPath
    }
  })

  test("withTerminalPath: false returns fallback list only", () => {
    process.env.PATH = "/some/terminal/bin:/another/path"
    const result = getEnhancedPath({ withTerminalPath: false })
    expect(result).toBe(FALLBACK.join(":"))
  })

  test("default (withTerminalPath: true) prepends process.env.PATH", () => {
    process.env.PATH = "/Users/x/.nvm/versions/node/v22/bin:/usr/local/bin"
    const result = getEnhancedPath()
    const parts = result.split(":")
    expect(parts[0]).toBe("/Users/x/.nvm/versions/node/v22/bin")
    expect(parts).toContain("/opt/homebrew/bin")
    expect(parts).toContain("/usr/bin")
  })

  test("dedups entries when terminal already contains a fallback dir", () => {
    process.env.PATH = "/usr/local/bin:/opt/homebrew/bin"
    const result = getEnhancedPath()
    const parts = result.split(":")
    const homebrewCount = parts.filter((p) => p === "/opt/homebrew/bin").length
    const usrLocalCount = parts.filter((p) => p === "/usr/local/bin").length
    expect(homebrewCount).toBe(1)
    expect(usrLocalCount).toBe(1)
  })

  test("handles missing PATH gracefully", () => {
    delete process.env.PATH
    const result = getEnhancedPath()
    expect(result).toBe(FALLBACK.join(":"))
  })

  test("handles empty PATH gracefully", () => {
    process.env.PATH = ""
    const result = getEnhancedPath()
    expect(result).toBe(FALLBACK.join(":"))
  })

  test("preserves order: terminal entries before fallback entries", () => {
    process.env.PATH = "/aaa:/bbb"
    const result = getEnhancedPath()
    const parts = result.split(":")
    expect(parts.indexOf("/aaa")).toBeLessThan(parts.indexOf("/opt/homebrew/bin"))
    expect(parts.indexOf("/bbb")).toBeLessThan(parts.indexOf("/opt/homebrew/bin"))
  })

  test("filters empty PATH segments", () => {
    process.env.PATH = "/foo::/bar:"
    const result = getEnhancedPath()
    const parts = result.split(":")
    expect(parts).not.toContain("")
    expect(parts).toContain("/foo")
    expect(parts).toContain("/bar")
  })
})
