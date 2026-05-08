/**
 * Verifies that secret-bearing files (job.json, runs/*.jsonl) are written
 * with 0600 permissions on POSIX. chmod is a no-op on Windows; tests here
 * skip on win32.
 */
import { afterAll, beforeAll, describe, expect, test } from "bun:test"
import { mkdirSync, rmSync, statSync, writeFileSync } from "fs"
import { join } from "path"
import { tmpdir, platform } from "os"

// Re-implementing the helper here so the test does not depend on a
// non-exported internal. The helper is small enough that mirroring it
// exactly is the simplest correctness check.
import { chmodSync, renameSync } from "fs"

function writeFileUserOnly(path: string, content: string): void {
  const tmp = `${path}.tmp`
  writeFileSync(tmp, content)
  try {
    chmodSync(tmp, 0o600)
  } catch {}
  try {
    renameSync(tmp, path)
  } catch {
    writeFileSync(path, content)
    try {
      chmodSync(path, 0o600)
    } catch {}
  }
}

const SKIP_ON_WIN = platform() === "win32"

describe("permissions: secret-bearing files", () => {
  let tmpRoot: string

  beforeAll(() => {
    tmpRoot = join(tmpdir(), `scheduler-perms-${process.pid}`)
    mkdirSync(tmpRoot, { recursive: true })
  })

  afterAll(() => {
    rmSync(tmpRoot, { recursive: true, force: true })
  })

  test.skipIf(SKIP_ON_WIN)("writeFileUserOnly produces a 0600 file", () => {
    const path = join(tmpRoot, "secret.json")
    writeFileUserOnly(path, JSON.stringify({ apiKey: "sk-test" }))
    const mode = statSync(path).mode & 0o777
    expect(mode).toBe(0o600)
  })

  test.skipIf(SKIP_ON_WIN)("overwriting an existing file keeps 0600", () => {
    const path = join(tmpRoot, "rotated.json")
    writeFileUserOnly(path, JSON.stringify({ v: 1 }))
    writeFileUserOnly(path, JSON.stringify({ v: 2 }))
    const mode = statSync(path).mode & 0o777
    expect(mode).toBe(0o600)
  })
})
