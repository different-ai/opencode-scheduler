import { execFileSync, type ExecFileSyncOptions } from "child_process"

export type FileExecutor = (file: string, args: readonly string[], options?: ExecFileSyncOptions) => Buffer | string

export function readExecutableVersion(
  executable: string,
  env: NodeJS.ProcessEnv,
  execute: FileExecutor = (file, args, options) => execFileSync(file, [...args], options) as Buffer | string
): string | null {
  try {
    const output = execute(executable, ["--version"], { env }).toString().trim()
    return output || null
  } catch {
    return null
  }
}
