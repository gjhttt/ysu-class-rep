"use client"

import { useProvider } from "../use-provider"
import type {
  ClassPeriod,
  ClassroomInfo,
  ClassroomQueryOptions,
  CodeItem,
  Course,
  CurrentWeek,
  CurrentWeekQueryOptions,
  Exam,
  ExamQueryOptions,
  GPAQueryOptions,
  GPAStats,
  Grade,
  GradeAnalyticsQueryOptions,
  GradeDistribution,
  GradeQueryOptions,
  GradeRanking,
  GradeRankingQueryOptions,
  GradeStatistics,
  MajorInfo,
  ScheduleQueryOptions,
  SchoolClassInfo,
  SchoolClassQueryOptions,
  TermCalendar,
  TermCalendarQueryOptions,
} from "../types"
import { useProviderQuery, type ProviderQueryResult } from "./use-provider-query"

export function useGrades(options?: GradeQueryOptions): ProviderQueryResult<Grade[]> {
  const provider = useProvider()
  return useProviderQuery("grades", "grades", () => provider.getGrades(options), options)
}
export function useGPAStats(options?: GPAQueryOptions): ProviderQueryResult<GPAStats> {
  const provider = useProvider()
  return useProviderQuery("gpa", "gpa-stats", () => provider.getGPAStats(options), options)
}

export function useGradeStatistics(
  options?: GradeAnalyticsQueryOptions
): ProviderQueryResult<GradeStatistics> {
  const provider = useProvider()
  return useProviderQuery(
    "gradeAnalytics",
    "grade-statistics",
    () => provider.getGradeStatistics(options),
    options
  )
}

export function useGradeDistribution(
  options?: GradeAnalyticsQueryOptions
): ProviderQueryResult<GradeDistribution[]> {
  const provider = useProvider()
  return useProviderQuery(
    "gradeAnalytics",
    "grade-distribution",
    () => provider.getGradeDistribution(options),
    options
  )
}

export function useGradeRanking(
  options?: GradeRankingQueryOptions
): ProviderQueryResult<GradeRanking> {
  const provider = useProvider()
  return useProviderQuery(
    "gradeAnalytics",
    "grade-ranking",
    () => provider.getGradeRanking(options),
    options
  )
}

export function useSchedule(options?: ScheduleQueryOptions): ProviderQueryResult<Course[]> {
  const provider = useProvider()
  return useProviderQuery("schedule", "schedule", () => provider.getSchedule(options), options)
}

export function useClassPeriods(): ProviderQueryResult<ClassPeriod[]> {
  const provider = useProvider()
  return useProviderQuery("classPeriods", "class-periods", () => provider.getClassPeriods())
}

export function useTermCalendar(
  options?: TermCalendarQueryOptions
): ProviderQueryResult<TermCalendar> {
  const provider = useProvider()
  return useProviderQuery(
    "termCalendar",
    "term-calendar",
    () => provider.getTermCalendar(options),
    options
  )
}

export function useCurrentWeek(
  options?: CurrentWeekQueryOptions
): ProviderQueryResult<CurrentWeek> {
  const provider = useProvider()
  return useProviderQuery(
    "currentWeek",
    "current-week",
    () => provider.getCurrentWeek(options),
    options
  )
}

export function useExams(options?: ExamQueryOptions): ProviderQueryResult<Exam[]> {
  const provider = useProvider()
  return useProviderQuery("exams", "exams", () => provider.getExams(options), options)
}

export function useSchoolGradeYears(): ProviderQueryResult<CodeItem[]> {
  const provider = useProvider()
  return useProviderQuery("schoolSchedule", "school-grade-years", () =>
    provider.getSchoolGradeYears()
  )
}

export function useSchoolDepartments(): ProviderQueryResult<CodeItem[]> {
  const provider = useProvider()
  return useProviderQuery("schoolSchedule", "school-departments", () =>
    provider.getSchoolDepartments()
  )
}

export function useSchoolMajors(department?: string): ProviderQueryResult<MajorInfo[]> {
  const provider = useProvider()
  return useProviderQuery(
    "schoolSchedule",
    "school-majors",
    () => provider.getSchoolMajors(department),
    department
  )
}

export function useSchoolClasses(
  options?: SchoolClassQueryOptions
): ProviderQueryResult<SchoolClassInfo[]> {
  const provider = useProvider()
  return useProviderQuery(
    "schoolSchedule",
    "school-classes",
    () => provider.getSchoolClasses(options),
    options
  )
}

export function useSchoolClassSchedule(
  classId: string,
  options?: ExamQueryOptions
): ProviderQueryResult<Course[]> {
  const provider = useProvider()
  return useProviderQuery(
    "schoolSchedule",
    "school-class-schedule",
    () => provider.getSchoolClassSchedule(classId, options),
    [classId, options]
  )
}

export function useSchoolCampuses(): ProviderQueryResult<CodeItem[]> {
  const provider = useProvider()
  return useProviderQuery("schoolSchedule", "school-campuses", () => provider.getSchoolCampuses())
}

export function useSchoolBuildings(campus?: string): ProviderQueryResult<CodeItem[]> {
  const provider = useProvider()
  return useProviderQuery(
    "schoolSchedule",
    "school-buildings",
    () => provider.getSchoolBuildings(campus),
    campus
  )
}

export function useSchoolClassrooms(
  options?: ClassroomQueryOptions
): ProviderQueryResult<ClassroomInfo[]> {
  const provider = useProvider()
  return useProviderQuery(
    "schoolSchedule",
    "school-classrooms",
    () => provider.getSchoolClassrooms(options),
    options
  )
}

export function useSchoolClassroomSchedule(
  code: string,
  options?: ExamQueryOptions
): ProviderQueryResult<Course[]> {
  const provider = useProvider()
  return useProviderQuery(
    "schoolSchedule",
    "school-classroom-schedule",
    () => provider.getSchoolClassroomSchedule(code, options),
    [code, options]
  )
}

