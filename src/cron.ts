const SYSTEMD_WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

export function splitCronExpression(cron: string): [string, string, string, string, string] {
  const parts = cron.trim().split(/\s+/)
  if (parts.length !== 5) {
    throw new Error(`Invalid cron: ${cron}`)
  }
  return parts as [string, string, string, string, string]
}

function uniqueSorted(values: number[]): number[] {
  return Array.from(new Set(values)).sort((a, b) => a - b)
}

export function parseCronField(
  field: string,
  min: number,
  max: number,
  label: string,
  allowSundaySeven = false
): number[] | null {
  if (field === "*") return null

  if (field.startsWith("*/")) {
    const step = parseInt(field.slice(2), 10)
    if (!Number.isFinite(step) || step <= 0) {
      throw new Error(`Invalid cron ${label} step: ${field}`)
    }
    const values: number[] = []
    for (let value = min; value <= max; value += step) values.push(value)
    return values
  }

  const parts = field.split(",")
  if (parts.length > 1) {
    return uniqueSorted(parts.map((part) => parseCronNumber(part, min, max, label, allowSundaySeven)))
  }
  if (/^\d+$/.test(field)) {
    return [parseCronNumber(field, min, max, label, allowSundaySeven)]
  }
  throw new Error(`Invalid cron ${label} field: ${field}`)
}

function parseCronNumber(
  value: string,
  min: number,
  max: number,
  label: string,
  allowSundaySeven: boolean
): number {
  const parsed = parseInt(value, 10)
  if (!Number.isFinite(parsed)) throw new Error(`Invalid cron ${label} value: ${value}`)
  const normalized = allowSundaySeven && parsed === 7 ? 0 : parsed
  if (normalized < min || normalized > max) throw new Error(`Invalid cron ${label} value: ${value}`)
  return normalized
}

export function validateCronExpression(cron: string): void {
  const [minute, hour, dayOfMonth, month, dayOfWeek] = splitCronExpression(cron)
  parseCronField(minute, 0, 59, "minute")
  parseCronField(hour, 0, 23, "hour")
  parseCronField(dayOfMonth, 1, 31, "day of month")
  parseCronField(month, 1, 12, "month")
  parseCronField(dayOfWeek, 0, 7, "day of week", true)
}

function formatSystemdValue(value: number, size: number): string {
  return value.toString().padStart(size, "0")
}

export function cronToSystemdCalendars(cron: string): string[] {
  const [minute, hour, dayOfMonth, month, dayOfWeek] = splitCronExpression(cron)
  const minuteValues = parseCronField(minute, 0, 59, "minute")
  const hourValues = parseCronField(hour, 0, 23, "hour")
  const dayValues = parseCronField(dayOfMonth, 1, 31, "day of month")
  const monthValues = parseCronField(month, 1, 12, "month")
  const weekdayValues = parseCronField(dayOfWeek, 0, 7, "day of week", true)

  const minutes = minuteValues ? minuteValues.map((value) => formatSystemdValue(value, 2)) : ["*"]
  const hours = hourValues ? hourValues.map((value) => formatSystemdValue(value, 2)) : ["*"]
  const days = dayValues ? dayValues.map((value) => formatSystemdValue(value, 2)) : ["*"]
  const months = monthValues ? monthValues.map((value) => formatSystemdValue(value, 2)) : ["*"]
  const weekdays = weekdayValues ? weekdayValues.map((value) => SYSTEMD_WEEKDAYS[value] ?? "*") : ["*"]
  const calendars: string[] = []

  const buildCalendars = (domValues: string[], dowValues: string[]) => {
    for (const minuteValue of minutes) {
      for (const hourValue of hours) {
        for (const domValue of domValues) {
          for (const monthValue of months) {
            for (const dowValue of dowValues) {
              const weekdayPrefix = dowValue === "*" ? "" : `${dowValue} `
              calendars.push(`${weekdayPrefix}*-${monthValue}-${domValue} ${hourValue}:${minuteValue}:00`)
            }
          }
        }
      }
    }
  }

  if (dayValues && weekdayValues) {
    buildCalendars(days, ["*"])
    buildCalendars(["*"], weekdays)
  } else {
    buildCalendars(days, weekdays)
  }
  return calendars
}
