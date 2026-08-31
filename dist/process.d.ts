import { type ExecFileSyncOptions } from "child_process";
export type FileExecutor = (file: string, args: readonly string[], options?: ExecFileSyncOptions) => Buffer | string;
export declare function readExecutableVersion(executable: string, env: NodeJS.ProcessEnv, execute?: FileExecutor): string | null;
