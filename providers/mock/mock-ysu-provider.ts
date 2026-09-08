import { useAuthStore } from "@/lib/stores/auth"
import { clearAllCache } from "@/lib/storage/cache"
import { NO_CAPABILITIES } from "@/providers/capabilities"
import type {
  AuthStatus,
  ClassPeriod,
  Course,
  CurrentWeek,
  CurrentWeekQueryOptions,
  Credential,
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
  LoginStep1Input,
  LoginStep1Result,
  ScheduleQueryOptions,
  StudentInfo,
  TermCalendar,
  TermCalendarQueryOptions,
  UnscheduledCourseQueryOptions,
} from "@/providers/types"
import { YSUProvider } from "@/providers/ysu"
import {
  MOCK_CURRENT_WEEK,
  MOCK_EXAMS,
  MOCK_GPA,
  MOCK_GRADES,
  MOCK_PERIODS,
  MOCK_SCHEDULE,
  MOCK_STUDENT,
  MOCK_TERM_CALENDAR,
  mockGradeDistribution,
  mockGradeRanking,
  mockGradeStatistics,
} from "./fixtures"

export class MockYSUProvider extends YSUProvider {
  readonly capabilities = {
    ...NO_CAPABILITIES,
    auth: true,
    grades: true,
    gradeAnalytics: true,
    schedule: true,
    labSchedule: true,
    exams: true,
    gpa: true,
    studentInfo: true,
    currentWeek: true,
    classPeriods: true,
    termCalendar: true,
  }

  protected async onInitialize(): Promise<void> {}
  protected async onReset(): Promise<void> {}
  async warmup(): Promise<void> {}
  async prepareLogin(): Promise<void> {}
  async resetLoginSession(): Promise<void> {}
  getCaptchaUrl(): string | null {
    return null
  }
  async checkCaptchaNeeded(): Promise<boolean> {
    return false
  }

  async login(credential: Credential): Promise<void> {
    const result = await this.loginStep1(credential)
    if (result.credential) useAuthStore.getState().setCredential(result.credential, result.username)
  }

  async loginStep1(input: LoginStep1Input): Promise<LoginStep1Result> {
    return {
      authenticated: Boolean(input.username && input.password),
      needsMfa: false,
      username: input.username,
      credential: input.username && input.password ? "mock-session" : undefined,
    }
  }

  async checkAuthStatus(): Promise<AuthStatus> {
    return { authenticated: this.isAuthenticated() }
  }

  async logout(): Promise<void> {
    useAuthStore.getState().clearCredential()
    clearAllCache()
  }

  isAuthenticated(): boolean {
    return useAuthStore.getState().isAuthenticated
  }

  async relogin(): Promise<boolean> {
    return this.isAuthenticated()
  }

  async getStudentInfo(): Promise<StudentInfo> {
    return { ...MOCK_STUDENT }
  }

  async getGrades(options?: GradeQueryOptions): Promise<Grade[]> {
    const courseName = options?.courseName?.trim().toLocaleLowerCase()
    return MOCK_GRADES.filter(
      (grade) =>
        (!options?.semester || grade.semester === options.semester) &&
        (!courseName || grade.courseName.toLocaleLowerCase().includes(courseName))
    ).map((grade) => ({ ...grade }))
  }

  async getGPAStats(_options?: GPAQueryOptions): Promise<GPAStats> {
    return { ...MOCK_GPA }
  }

  async getGradeStatistics(options?: GradeAnalyticsQueryOptions): Promise<GradeStatistics> {
    return mockGradeStatistics(options?.courseCode ? "course" : "class")
  }

  async getGradeDistribution(options?: GradeAnalyticsQueryOptions): Promise<GradeDistribution[]> {
    return mockGradeDistribution(options?.courseCode ? "course" : "class")
  }

  async getGradeRanking(options?: GradeRankingQueryOptions): Promise<GradeRanking> {
    return mockGradeRanking(options?.courseCode ? "course" : "class")
  }

  async getSchedule(_options?: ScheduleQueryOptions): Promise<Course[]> {
    return MOCK_SCHEDULE.map((course) => ({ ...course, weekList: [...(course.weekList ?? [])] }))
  }

  async getUnscheduledCourses(_options?: UnscheduledCourseQueryOptions): Promise<Course[]> {
    return []
  }

  async getClassPeriods(): Promise<ClassPeriod[]> {
    return MOCK_PERIODS.map((period) => ({ ...period }))
  }

  async getTermCalendar(_options?: TermCalendarQueryOptions): Promise<TermCalendar> {
    return { ...MOCK_TERM_CALENDAR }
  }

  async getCurrentWeek(_options?: CurrentWeekQueryOptions): Promise<CurrentWeek> {
    return { ...MOCK_CURRENT_WEEK }
  }

  async getCurrentWeekNumber(_options?: CurrentWeekQueryOptions): Promise<number> {
    return MOCK_CURRENT_WEEK.week
  }

  async getExams(_options?: ExamQueryOptions): Promise<Exam[]> {
    return MOCK_EXAMS.map((exam) => ({ ...exam }))
  }
}
