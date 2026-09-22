import { describe, expect, it } from "vitest"
import type { Grade } from "@/providers/types"
import { calculateTermWeightedGpa, numericGradeValue, sortSemestersNewestFirst } from "./grades"

function grade(overrides: Partial<Grade>): Grade {
  return {
    courseName: "测试课程",
    isMajor: true,
    isRetake: "正考",
    isPass: true,
    isValid: true,
    isDegreeCourse: false,
    ...overrides,
  }
}

describe("grade display calculations", () => {
  it("calculates weighted GPA and applies the 1.2 degree-course weight", () => {
    const result = calculateTermWeightedGpa([
      grade({ numericGradePoint: 4, numericCredit: 2, isDegreeCourse: true }),
      grade({ gradePoint: "3", credit: "2" }),
      grade({ numericGradePoint: 5, numericCredit: 10, isRetake: "重修" }),
    ])

    expect(result).toBe("3.5455")
  })

  it("returns null when no valid GPA data exists", () => {
    expect(calculateTermWeightedGpa([grade({ numericCredit: 0 })])).toBeNull()
  })

  it("sorts academic semesters newest first", () => {
    expect(sortSemestersNewestFirst(["2024-2025-2", "2026-2027-1", "2025-2026-1"])).toEqual([
      "2026-2027-1",
      "2025-2026-1",
      "2024-2025-2",
    ])
  })

  it("uses the normalized number before the display fallback", () => {
    expect(numericGradeValue(88, "95")).toBe(88)
    expect(numericGradeValue(undefined, "")).toBeUndefined()
    expect(numericGradeValue(undefined, "   ")).toBeUndefined()
    expect(numericGradeValue(undefined, "0")).toBe(0)
    expect(numericGradeValue(undefined, "优秀")).toBeUndefined()
  })
})
