export declare function splitCronExpression(cron: string): [string, string, string, string, string];
export declare function parseCronField(field: string, min: number, max: number, label: string, allowSundaySeven?: boolean): number[] | null;
export declare function validateCronExpression(cron: string): void;
export declare function cronToSystemdCalendars(cron: string): string[];
