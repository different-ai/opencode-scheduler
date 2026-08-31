export interface ExecutableProbeDependencies {
    access: (path: string, mode: number) => void;
    isFile: (path: string) => boolean;
    cwd: () => string;
    platform: NodeJS.Platform;
}
export declare function resolveExecutable(command: string, env: NodeJS.ProcessEnv, dependencies?: ExecutableProbeDependencies): string | null;
