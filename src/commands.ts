export const schedulerCommands: Record<
  string,
  { template: string; description?: string }
> = {
  "scheduler-list": {
    template: "Use the list_jobs tool to show all scheduled jobs. $ARGUMENTS",
    description: "List jobs in current scope or all scopes",
  },
  "scheduler-get": {
    template:
      "Use the get_job tool to show details for the job named: $ARGUMENTS",
    description: "Show details for a specific job",
  },
  "scheduler-logs": {
    template:
      "Use the job_logs tool to show recent logs for the job named: $ARGUMENTS",
    description: "Show recent logs for a job",
  },
  "scheduler-delete": {
    template:
      "Use the delete_job tool to delete the job named: $ARGUMENTS. IMPORTANT: You must confirm the deletion with the user before proceeding.",
    description: "Delete a job (destructive operation)",
  },
}

export function applySchedulerCommands(config: {
  command?: Record<string, any>
}): void {
  config.command = config.command || {}
  Object.assign(config.command, schedulerCommands)
}
