export type LinuxSchedulerBackend = "systemd" | "cron";
export interface SystemdFallbackDependencies {
    installSystemd: () => void;
    isCronAvailable: () => boolean;
    installCron: () => void;
}
export interface LinuxSchedulerDependencies extends SystemdFallbackDependencies {
    systemdAvailable: boolean;
}
export declare function installSystemdWithCronFallback(dependencies: SystemdFallbackDependencies): LinuxSchedulerBackend;
export declare function installLinuxScheduler(dependencies: LinuxSchedulerDependencies): LinuxSchedulerBackend;
