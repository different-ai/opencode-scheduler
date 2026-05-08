import { describe, expect, test } from "bun:test"
import * as entry from "./plugin-entry"

/**
 * Lock the public surface of the bundle entry. OpenCode's plugin loader
 * iterates every named export of `dist/index.js` and invokes each as
 * `await fn(input)`. A stray `export *` or convenience re-export here
 * silently reintroduces the bootstrap-hang bug (blank TUI on startup).
 *
 * Reference: opencode-fork/packages/opencode/src/plugin/index.ts:87-110
 */
describe("plugin-entry", () => {
  test("exports only SchedulerPlugin and default", () => {
    expect(Object.keys(entry).sort()).toEqual(["SchedulerPlugin", "default"])
  })

  test("default export is the plugin function", () => {
    expect(typeof entry.SchedulerPlugin).toBe("function")
    expect(entry.default).toBe(entry.SchedulerPlugin)
  })
})
