import { describe, expect, it } from "vitest"
import type { Course, Grade } from "@/providers/types"
import { mergeCourseProfiles } from "./course-data"
import { courseEntityId } from "@/lib/storage/gpa-predictor"

describe("course profile merge", () => {
  it("deduplicates multiple schedule slots and preserves local credit overrides", () => {
    const schedule: Course[] = [1, 3].map((startSection) => ({
      name: "大学物理",
      code: "PHY01",
      classId: "CLASS-1",
      weekDay: 1,
      startSection,
      endSection: startSection + 1,
      credit: "3",
    }))
    const id = "2026-2027-1|code:PHY01"
    const merged = mergeCourseProfiles(
      {
        [id]: {
          id,
          name: "大学物理",
          semester: "2026-2027-1",
          originalCredit: 3,
          overrideCredit: 3.5,
          degreeStatus: "unknown",
          source: "schedule",
        },
      },
      [],
      schedule,
      "2026-2027-1"
    )
    expect(Object.keys(merged)).toEqual([id])
    expect(merged[id]?.overrideCredit).toBe(3.5)
  })

  it("uses confirmed grade metadata without replacing a local correction", () => {
    const grade: Grade = {
      courseName: "大学物理",
      courseCode: "PHY01",
      semester: "2026-2027-1",
      numericCredit: 3,
      isMajor: true,
      isRetake: "正考",
      isPass: true,
      isValid: true,
      isDegreeCourse: true,
    }
    const id = "2026-2027-1|code:PHY01"
    const merged = mergeCourseProfiles(
      {
        [id]: {
          id,
          name: "大学物理",
          semester: "2026-2027-1",
          overrideCredit: 4,
          degreeStatus: "non-degree",
          degreeSource: "user",
          source: "schedule",
        },
      },
      [grade],
      [],
      "2026-2027-1"
    )
    expect(merged[id]).toMatchObject({
      originalCredit: 3,
      overrideCredit: 4,
      degreeStatus: "non-degree",
    })
  })

  it("does not link a course by name alone", () => {
    expect(courseEntityId({ semester: "2026-2027-1" })).toBeNull()
    expect(courseEntityId({ semester: "2026-2027-1", courseCode: "PHY01" })).toBe(
      "2026-2027-1|code:PHY01"
    )
  })
})
