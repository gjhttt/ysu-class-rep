/**
 * 教务系时间串（YYYY-MM-DDTHH:mm:ss，协议层归一后的 ISO 本地时间）的展示格式化。
 */

/** "2026-03-01T08:00:00" → "2026-03-01 08:00"；空值回退空串。 */
export function formatLocalDateTime(value?: string): string {
  return value ? value.slice(0, 16).replace("T", " ") : ""
}

/** 起止时间区间展示：两侧都有用 " ~ " 连接，只有一侧则原样返回。 */
export function formatTimeRange(start?: string, end?: string): string {
  const s = formatLocalDateTime(start)
  const e = formatLocalDateTime(end)
  if (s && e) return `${s} ~ ${e}`
  return s || e
}

const beijingPartsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: "Asia/Shanghai",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  hourCycle: "h23",
})

function beijingParts(timestamp: number): Record<string, number> {
  return Object.fromEntries(
    beijingPartsFormatter
      .formatToParts(timestamp)
      .filter((part) => part.type !== "literal")
      .map((part) => [part.type, Number(part.value)])
  )
}

export function getBeijingClockMinutes(timestamp = Date.now()): number {
  const parts = beijingParts(timestamp)
  return (parts.hour ?? 0) * 60 + (parts.minute ?? 0)
}

export function beijingDayDifference(timestamp: number, now = Date.now()): number {
  const target = beijingParts(timestamp)
  const today = beijingParts(now)
  const targetDay = Date.UTC(target.year, target.month - 1, target.day)
  const todayDay = Date.UTC(today.year, today.month - 1, today.day)
  return Math.round((targetDay - todayDay) / 86_400_000)
}
