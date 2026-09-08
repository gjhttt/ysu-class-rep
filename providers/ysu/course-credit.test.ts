import { describe, expect, it } from "vitest"
import { fillScheduleCredits } from "./course-credit"

describe("fillScheduleCredits", () => {
  it("uses course code first and only uses an unambiguous normalized-name fallback", () => {
    const courses = [
      { code: "EN01", name: "拓展外语", credit: "1" },
      { code: "PE01", name: "体育（四）", credit: "" },
      { name: "物理实验 B1", credit: "" },
      { name: "同名课", credit: "" },
    ]
    const plan = [
      { courseCode: "EN01", courseName: "拓展外语", credit: "1.5" },
      { courseCode: "PE01", courseName: "体育(四)", credit: "1" },
      { courseCode: "PH01", courseName: "物理实验B1", credit: "1.0" },
      { courseCode: "A", courseName: "同名课", credit: "1" },
      { courseCode: "B", courseName: "同名课", credit: "2" },
    ]

    expect(fillScheduleCredits(courses, plan).map((course) => course.credit)).toEqual([
      "1.5",
      "1",
      "1.0",
      "",
    ])
  })
})
