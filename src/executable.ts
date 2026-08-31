import { accessSync, constants, statSync } from "fs"
import { delimiter, isAbsolute, join, win32 } from "path"

export interface ExecutableProbeDependencies {
  access: (path: string, mode: number) => void
  isFile: (path: string) => boolean
  cwd: () => string
  platform: NodeJS.Platform
}

const defaults: ExecutableProbeDependencies = {
  access: accessSync,
  isFile: (path) => statSync(path).isFile(),
  cwd: process.cwd,
  platform: process.platform,
}

function candidates(command: string, pathValue: string, pathExt: string | undefined, dependencies: ExecutableProbeDependencies): string[] {
  const windows = dependencies.platform === "win32"
  const pathDelimiter = windows ? win32.delimiter : delimiter
  const pathJoin = windows ? win32.join : join
  const absolute = windows ? win32.isAbsolute(command) : isAbsolute(command)
  const extensions = windows
    ? (pathExt ?? ".COM;.EXE;.BAT;.CMD").split(";").filter(Boolean)
    : [""]
  const names = windows && !extensions.some((extension) => command.toLowerCase().endsWith(extension.toLowerCase()))
    ? extensions.map((extension) => `${command}${extension}`)
    : [command]
  if (absolute) return names
  return pathValue.split(pathDelimiter).flatMap((entry) => {
    const directory = entry || dependencies.cwd()
    return names.map((name) => pathJoin(directory, name))
  })
}

export function resolveExecutable(
  command: string,
  env: NodeJS.ProcessEnv,
  dependencies: ExecutableProbeDependencies = defaults
): string | null {
  const absolute = dependencies.platform === "win32" ? win32.isAbsolute(command) : isAbsolute(command)
  if (!command || (!absolute && /[\\/]/.test(command))) return null
  for (const candidate of candidates(command, env.PATH ?? "", env.PATHEXT, dependencies)) {
    try {
      if (!dependencies.isFile(candidate)) continue
      dependencies.access(candidate, dependencies.platform === "win32" ? constants.F_OK : constants.X_OK)
      return candidate
    } catch {}
  }
  return null
}
