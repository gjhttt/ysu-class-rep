import { describe, expect, it } from "vitest"
import {
  parseGpaStats,
  parseGrade,
  parseGradeDistribution,
  parseGradeRanking,
  parseGradeStatistics,
} from "./jwxt"

describe("JWXT grade parsers", () => {
  it("maps verified grade and GPA field names", () => {
    const grade = parseGrade({
      XSKCM: "工程材料基础",
      XSKCH: "M1001",
      JXBID: "CLASS-1",
      ZCJ: "92",
      XSZCJMC: "A",
      XFJD: "4.2",
      XF: "2.0",
      XNXQDM: "2026-2027-1",
      KCXZDM_DISPLAY: "必修",
      SFZX: "1",
      CXCKDM_DISPLAY: "正考",
      SFJG: "1",
      SFYX: "1",
      SFZGKC: "1",
    })
    const gpa = parseGpaStats({ PPJDCX: "3.879", JQPJF: "88.87", SSPJF: "88.97" })

    expect(grade).toMatchObject({
      courseName: "工程材料基础",
      courseCode: "M1001",
      classId: "CLASS-1",
      numericScore: 92,
      numericGradePoint: 4.2,
      numericCredit: 2,
      term: "2026-2027-1",
      isPass: true,
    })
    expect(gpa).toMatchObject({
      numericGpaInitial: 3.879,
      numericWeightedAvg: 88.87,
      numericArithmeticAvg: 88.97,
    })
  })

  it("keeps class and course ranking scopes distinct", () => {
    const classRank = parseGradeRanking({
      TJLX: "01",
      XNXQDM: "2026-2027-1",
      JXBID: "CLASS-1",
      XH: "2026000000",
      PMF: "92",
      PM: "3",
      ZRS: "40",
      PMLX: "教学班",
    })
    const courseRank = parseGradeRanking({
      TJLX: "02",
      XNXQDM: "2026-2027-1",
      KCH: "M1001",
      PMF: "92",
      PM: "12",
      ZRS: "196",
      PMLX: "同课程",
    })

    expect(classRank).toMatchObject({ scope: "class", classId: "CLASS-1", rank: 3, total: 40 })
    expect(courseRank).toMatchObject({
      scope: "course",
      courseCode: "M1001",
      rank: 12,
      total: 196,
    })
  })

  it("parses statistics and distributions without inventing labels", () => {
    expect(parseGradeStatistics({ TJLX: "01", ZGF: "98", ZDF: "61", PJF: "84.6" })).toMatchObject({
      scope: "class",
      highestScore: 98,
      lowestScore: 61,
      averageScore: 84.6,
    })
    expect(
      parseGradeDistribution({ TJLX: "02", DJDM: "A", DJDM_DISPLAY: "优秀", DJSL: "8" })
    ).toMatchObject({ scope: "course", levelCode: "A", levelName: "优秀", count: 8 })
  })
})
