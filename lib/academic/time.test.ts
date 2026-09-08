import { describe, expect, it } from "vitest"
import { beijingDayDifference, getBeijingClockMinutes } from "./time"

describe("Beijing academic time", () => {
  it("uses Asia/Shanghai across a UTC date boundary", () => {
    const now = Date.parse("2026-09-03T16:30:00Z")
    const tomorrow = Date.parse("2026-09-04T16:00:00Z")
    expect(getBeijingClockMinutes(now)).toBe(30)
    expect(beijingDayDifference(tomorrow, now)).toBe(1)
  })
})
