import { describe, expect, it } from "vitest"
import { formatExamTime, getExamMessageKey, recentSemesterCodes } from "./exam-utils"

describe("exam display helpers", () => {
  it("builds recent terms from the current academic term", () => {
    expect(recentSemesterCodes("2026-2027-1", 4)).toEqual([
      "2026-2027-1",
      "2025-2026-2",
      "2025-2026-1",
      "2024-2025-2",
    ])
  })

  it("adds the exam date without duplicating an existing date", () => {
    expect(
      formatExamTime({
        name: "测试课程",
        startAt: "2026-12-28T09:00:00",
        endAt: "2026-12-28T11:00:00",
        timeText: "09:00-11:00",
      })
    ).toBe("2026-12-28 09:00-11:00")

    expect(
      formatExamTime({
        name: "测试课程",
        startAt: "2026-12-28T09:00:00",
        timeText: "2026-12-28 09:00-11:00",
      })
    ).toBe("2026-12-28 09:00-11:00")
  })

  it("chooses exam messages by count and nearest date", () => {
    const now = new Date("2026-12-20T08:00:00+08:00").getTime()
    const soon = { name: "近期开考", startAt: "2026-12-22T09:00:00" }
    const later = { name: "稍后开考", startAt: "2026-12-28T09:00:00" }

    expect(getExamMessageKey([], now)).toBe("exams.messageZero")
    expect(getExamMessageKey([soon], now)).toBe("exams.messageOneSoon")
    expect(getExamMessageKey([later, later], now)).toBe("exams.messageTwoLater")
    expect(getExamMessageKey([soon, later, later], now)).toBe("exams.messageManySoon")
  })
})
