import type {
  ClassPeriod,
  Course,
  CurrentWeek,
  Exam,
  GPAStats,
  Grade,
  GradeDistribution,
  GradeRanking,
  GradeStatistics,
  StudentInfo,
  TermCalendar,
} from "@/providers/types"

export const MOCK_STUDENT = {
  name: "脱敏示例",
  studentId: "2026000000",
  department: "示例学院",
  major: "示例专业",
  className: "示例班级",
  gradeLevel: "2026",
  campus: "东校区",
  studentStatus: "在籍",
} satisfies StudentInfo

export const MOCK_GRADES = [
  {
    courseName: "工程材料基础",
    courseCode: "MOCK1001",
    classId: "MOCK-CLASS-01",
    score: "92",
    numericScore: 92,
    gradeLevel: "A",
    gradePoint: "4.2",
    numericGradePoint: 4.2,
    credit: "2.0",
    numericCredit: 2,
    semester: "2026-2027-1",
    courseType: "必修",
    isMajor: true,
    isRetake: "正考",
    isPass: true,
    isValid: true,
    isDegreeCourse: true,
    metadata: { mock: true },
  },
  {
    courseName: "大学英语",
    courseCode: "MOCK1002",
    classId: "MOCK-CLASS-02",
    score: "86",
    numericScore: 86,
    gradeLevel: "B+",
    gradePoint: "3.6",
    numericGradePoint: 3.6,
    credit: "2.0",
    numericCredit: 2,
    semester: "2026-2027-1",
    courseType: "必修",
    isMajor: true,
    isRetake: "正考",
    isPass: true,
    isValid: true,
    isDegreeCourse: false,
    metadata: { mock: true },
  },
  {
    courseName: "高等数学",
    courseCode: "MOCK0901",
    classId: "MOCK-CLASS-03",
    score: "89",
    numericScore: 89,
    gradeLevel: "A-",
    gradePoint: "3.9",
    numericGradePoint: 3.9,
    credit: "5.0",
    numericCredit: 5,
    semester: "2025-2026-2",
    courseType: "必修",
    isMajor: true,
    isRetake: "正考",
    isPass: true,
    isValid: true,
    isDegreeCourse: true,
    metadata: { mock: true },
  },
] satisfies Grade[]

export const MOCK_GPA = {
  gpaInitial: "3.879",
  numericGpaInitial: 3.879,
  weightedAvg: "88.87",
  numericWeightedAvg: 88.87,
  arithmeticAvg: "88.97",
  numericArithmeticAvg: 88.97,
  gpaHighest: "3.879",
  numericGpaHighest: 3.879,
  requiredGpaHighest: "3.856",
  numericRequiredGpaHighest: 3.856,
  degreeGpaInitial: "3.473",
  numericDegreeGpaInitial: 3.473,
  degreeWeightedAvg: "84.13",
  numericDegreeWeightedAvg: 84.13,
  requiredCreditEarned: "64.0",
  numericRequiredCreditEarned: 64,
} satisfies GPAStats

export const MOCK_CURRENT_WEEK = {
  week: 2,
  weekday: 5,
  semester: "2026-2027-1",
  date: "2026-09-04",
  weekStartDate: "2026-08-31",
  weekEndDate: "2026-09-06",
} satisfies CurrentWeek

export const MOCK_SCHEDULE = [
  {
    name: "工程材料基础",
    code: "MOCK1001",
    teacher: "示例教师",
    classroom: "东校区 A101",
    weekDay: 5,
    startSection: 1,
    endSection: 2,
    weeks: "1-16周",
    weekList: Array.from({ length: 16 }, (_, index) => index + 1),
    courseType: "理论课",
    classId: "MOCK-CLASS-01",
    raw: { mock: true },
  },
  {
    name: "机械实验",
    code: "MOCK1003",
    teacher: "示例教师",
    classroom: "实验中心 203",
    weekDay: 5,
    startSection: 5,
    endSection: 6,
    weeks: "2,4,6,8周",
    weekList: [2, 4, 6, 8],
    courseType: "实验课",
    classId: "MOCK-CLASS-04",
    raw: { mock: true },
  },
] satisfies Course[]

export const MOCK_EXAMS = [
  {
    name: "工程材料基础",
    examName: "期末考试",
    startAt: "2026-12-28T09:00:00",
    endAt: "2026-12-28T11:00:00",
    startTimestamp: Date.parse("2026-12-28T09:00:00+08:00"),
    endTimestamp: Date.parse("2026-12-28T11:00:00+08:00"),
    status: "upcoming",
    timeText: "2026-12-28 09:00 - 11:00",
    examLocation: "东校区 B201",
    seatNumber: "18",
    raw: { mock: true },
  },
] satisfies Exam[]

export const MOCK_PERIODS = Array.from({ length: 12 }, (_, index) => ({
  section: index + 1,
  name: `第${index + 1}节`,
  isInUse: true,
})) satisfies ClassPeriod[]

export const MOCK_TERM_CALENDAR = {
  semester: "2026-2027-1",
  startDate: "2026-08-31",
  totalWeeks: 20,
  teachingWeeks: 18,
  isInUse: true,
  raw: { mock: true },
} satisfies TermCalendar

export function mockGradeStatistics(scope: "class" | "course"): GradeStatistics {
  return {
    scope,
    semester: "2026-2027-1",
    classId: scope === "class" ? "MOCK-CLASS-01" : undefined,
    courseCode: scope === "course" ? "MOCK1001" : undefined,
    highestScore: scope === "class" ? 98 : 100,
    lowestScore: scope === "class" ? 61 : 55,
    averageScore: scope === "class" ? 84.6 : 82.9,
    metadata: { mock: true },
  }
}

export function mockGradeDistribution(scope: "class" | "course"): GradeDistribution[] {
  return [
    { scope, levelName: "90-100", count: 8, metadata: { mock: true } },
    { scope, levelName: "80-89", count: 16, metadata: { mock: true } },
    { scope, levelName: "70-79", count: 9, metadata: { mock: true } },
    { scope, levelName: "60-69", count: 5, metadata: { mock: true } },
    { scope, levelName: "不及格", count: 2, metadata: { mock: true } },
  ]
}

export function mockGradeRanking(scope: "class" | "course"): GradeRanking {
  return {
    scope,
    semester: "2026-2027-1",
    studentId: MOCK_STUDENT.studentId,
    classId: scope === "class" ? "MOCK-CLASS-01" : undefined,
    courseCode: scope === "course" ? "MOCK1001" : undefined,
    score: 92,
    rank: scope === "class" ? 3 : 12,
    total: scope === "class" ? 40 : 196,
    rankingType: scope === "class" ? "教学班" : "同课程总体",
    metadata: { mock: true },
  }
}
