import { describe, expect, test, beforeEach, afterEach } from "bun:test"
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "fs"
import { tmpdir } from "os"
import { join } from "path"

import { listScopeIds } from "../src/index"

let root: string

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), "scheduler-scope-listing-"))
})

afterEach(() => {
  rmSync(root, { recursive: true, force: true })
})

describe("listScopeIds", () => {
  test("returns empty array when the scopes root does not exist", () => {
    const missing = join(root, "does-not-exist")
    expect(listScopeIds(missing)).toEqual([])
  })

  test("returns empty array when the scopes root is empty", () => {
    expect(listScopeIds(root)).toEqual([])
  })

  test("returns names of real scope subdirectories sorted ascending", () => {
    mkdirSync(join(root, "beta-scope", "jobs"), { recursive: true })
    mkdirSync(join(root, "alpha-scope", "jobs"), { recursive: true })

    const result = listScopeIds(root)

    expect(result).toEqual(["alpha-scope", "beta-scope"])
  })

  test("skips macOS Finder metadata files like .DS_Store", () => {
    mkdirSync(join(root, "real-scope", "jobs"), { recursive: true })
    writeFileSync(join(root, ".DS_Store"), Buffer.from([0x00, 0x01, 0x02, 0x03, 0x04]))

    const result = listScopeIds(root)

    expect(result).toEqual(["real-scope"])
  })

  test("skips plain files that share the scopes root with directories", () => {
    mkdirSync(join(root, "real-scope", "jobs"), { recursive: true })
    writeFileSync(join(root, "foo.txt"), "noise")
    writeFileSync(join(root, "leftover.json"), "{}")

    const result = listScopeIds(root)

    expect(result).toEqual(["real-scope"])
  })

  test("mixed real scope, .DS_Store, and stray file returns only the real scope", () => {
    mkdirSync(join(root, "real-scope", "jobs"), { recursive: true })
    mkdirSync(join(root, "another-real", "jobs"), { recursive: true })
    writeFileSync(join(root, ".DS_Store"), "mac noise")
    writeFileSync(join(root, "stray.txt"), "stray")

    const result = listScopeIds(root)

    expect(result).toEqual(["another-real", "real-scope"])
  })

  test("does not throw when a non-directory entry is encountered", () => {
    mkdirSync(join(root, "real-scope", "jobs"), { recursive: true })
    writeFileSync(join(root, ".DS_Store"), "mac noise")
    writeFileSync(join(root, "stray.txt"), "stray")

    expect(() => listScopeIds(root)).not.toThrow()
  })
})
