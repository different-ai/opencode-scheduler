import { chmodSync, existsSync, lstatSync, mkdirSync, readFileSync, readlinkSync, renameSync, rmSync, statSync, symlinkSync, unlinkSync, writeFileSync } from "fs";
import type { ExecFileSyncOptions } from "child_process";
export type SystemdCommandRunner = (executable: "systemctl", args: readonly string[], options?: ExecFileSyncOptions) => Buffer | string;
export declare class SystemdNonFallbackError extends Error {
    readonly fallbackSafe = false;
    readonly originalError: unknown;
    constructor(message: string, originalError?: unknown);
}
export declare class SystemdFallbackSafeError extends Error {
    readonly fallbackSafe = true;
    readonly originalError: unknown;
    constructor(message: string, originalError?: unknown);
}
export interface RuntimeEnvDependencies {
    exists: (path: string) => boolean;
    uid: () => number | undefined;
}
export declare function withSystemdRuntimeEnv(env: NodeJS.ProcessEnv, dependencies?: RuntimeEnvDependencies): NodeJS.ProcessEnv;
export interface SystemdInstallRequest {
    unitDir: string;
    lockDir?: string;
    serviceUnit: string;
    timerUnit: string;
    serviceContent: string;
    timerContent: string;
    lockKey?: string;
    legacyServiceUnit?: string;
    legacyTimerUnit?: string;
    run: SystemdCommandRunner;
    fileSystem?: SystemdFileSystem;
    lock?: Partial<SystemdLockOptions>;
    onWarning?: (message: string, error: unknown) => void;
}
export interface SystemdFileSystem {
    chmod: typeof chmodSync;
    exists: typeof existsSync;
    lstat: typeof lstatSync;
    mkdir: typeof mkdirSync;
    readFile: typeof readFileSync;
    readlink: typeof readlinkSync;
    rename: typeof renameSync;
    rm: typeof rmSync;
    stat: typeof statSync;
    symlink: typeof symlinkSync;
    unlink: typeof unlinkSync;
    writeFile: typeof writeFileSync;
}
interface SystemdLockOptions {
    timeoutMs: number;
    staleAfterMs: number;
    pollMs: number;
    now: () => number;
    pid: number;
    isPidAlive: (pid: number) => boolean;
    sleep: (milliseconds: number) => void;
}
export declare function installSystemdUnits(request: SystemdInstallRequest): void;
export {};
