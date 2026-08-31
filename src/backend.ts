export type LinuxSchedulerBackend = "systemd" | "cron"

export interface SystemdFallbackDependencies {
  installSystemd: () => void
  isCronAvailable: () => boolean
  installCron: () => void
}

export interface LinuxSchedulerDependencies extends SystemdFallbackDependencies {
  systemdAvailable: boolean
}

export function installSystemdWithCronFallback(dependencies: SystemdFallbackDependencies): LinuxSchedulerBackend {
  try {
    dependencies.installSystemd()
    return "systemd"
  } catch (error) {
    if (!(error instanceof SystemdFallbackSafeError)) throw error
    if (!dependencies.isCronAvailable()) throw error
    dependencies.installCron()
    return "cron"
  }
}

export function installLinuxScheduler(dependencies: LinuxSchedulerDependencies): LinuxSchedulerBackend {
  if (!dependencies.systemdAvailable) {
    if (!dependencies.isCronAvailable()) {
      throw new Error("No supported Linux scheduler backend is available")
    }
    dependencies.installCron()
    return "cron"
  }
  return installSystemdWithCronFallback(dependencies)
}
import { SystemdFallbackSafeError } from "./systemd"
