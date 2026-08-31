import { basename, resolve } from "path"

export const NAME_MAX_BYTES = 255
const SAFE_IDENTIFIER = /^[a-z0-9][a-z0-9-]*$/

export function slugifyIdentifier(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")
}

function fnv1a64Hex(input: string): string {
  let hash = 0xcbf29ce484222325n
  const data = Buffer.from(input, "utf8")
  for (const byte of data) {
    hash ^= BigInt(byte)
    hash = (hash * 0x100000001b3n) & 0xffffffffffffffffn
  }
  return hash.toString(16).padStart(16, "0")
}

export function deriveSafeScopeId(workdir: string): string {
  const normalized = resolve(workdir.trim())
  const rawBase = slugifyIdentifier(basename(normalized)) || "workspace"
  const suffix = fnv1a64Hex(normalized).slice(0, 12)
  const maxBaseBytes = 96 - suffix.length - 1
  const base = rawBase.slice(0, maxBaseBytes).replace(/-+$/g, "") || "workspace"
  return `${base}-${suffix}`
}

export function isSafeIdentifier(value: string): boolean {
  return SAFE_IDENTIFIER.test(value)
}
