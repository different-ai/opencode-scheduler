export const schedulerCommands: Record<
  string,
  { template: string; description?: string }
> = {
  "scheduler-list": {
    template: "Use the list_jobs tool to show all scheduled jobs. $ARGUMENTS",
    description: "列出当前 scope 或全部 scope 的任务",
  },
  "scheduler-get": {
    template:
      "Use the get_job tool to show details for the job named: $ARGUMENTS",
    description: "查看某个任务的详情",
  },
  "scheduler-logs": {
    template:
      "Use the job_logs tool to show recent logs for the job named: $ARGUMENTS",
    description: "查看某个任务的日志",
  },
  "scheduler-delete": {
    template:
      "Use the delete_job tool to delete the job named: $ARGUMENTS. IMPORTANT: You must confirm the deletion with the user before proceeding.",
    description: "删除某个任务（危险操作）",
  },
}

export function applySchedulerCommands(config: {
  command?: Record<string, any>
}): void {
  config.command = config.command || {}
  Object.assign(config.command, schedulerCommands)
}
