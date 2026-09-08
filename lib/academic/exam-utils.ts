import type { Exam } from "@/providers/types"
import { beijingDayDifference } from "./time"

export type ExamMessageKey =
  | "exams.messageZero"
  | "exams.messageOneSoon"
  | "exams.messageOneLater"
  | "exams.messageTwoSoon"
  | "exams.messageTwoLater"
  | "exams.messageManySoon"
  | "exams.messageManyLater"

function parseLocalDateTime(value: string | undefined): Date | null {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function dateFromTimestamp(value: number | undefined): Date | null {
  if (value === undefined) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function formatTimeFromDateTime(value: string | undefined): string | null {
  if (!value) return null
  const match = value.match(/T(\d{2}:\d{2})/)
  return match?.[1] ?? null
}

export function getExamStartTime(exam: Exam): Date | null {
  return dateFromTimestamp(exam.startTimestamp) ?? parseLocalDateTime(exam.startAt)
}

export function getExamEndTime(exam: Exam): Date | null {
  return (
    dateFromTimestamp(exam.endTimestamp) ?? parseLocalDateTime(exam.endAt) ?? getExamStartTime(exam)
  )
}

export function isExamCompleted(exam: Exam, now: Date = new Date()): boolean {
  const end = getExamEndTime(exam)
  if (end) return end < now
  if (exam.status === "completed") return true
  if (exam.status === "upcoming") return false
  return false
}

export function compareExamStartTime(a: Exam, b: Exam): number {
  const aStart = getExamStartTime(a)?.getTime() ?? Number.POSITIVE_INFINITY
  const bStart = getExamStartTime(b)?.getTime() ?? Number.POSITIVE_INFINITY
  if (aStart !== bStart) return aStart - bStart

  const aEnd = getExamEndTime(a)?.getTime() ?? Number.POSITIVE_INFINITY
  const bEnd = getExamEndTime(b)?.getTime() ?? Number.POSITIVE_INFINITY
  return aEnd - bEnd
}

export function getExamMessageKey(exams: Exam[], now = Date.now()): ExamMessageKey {
  if (exams.length === 0) return "exams.messageZero"

  const nearestTime = Math.min(
    ...exams.map((exam) => getExamStartTime(exam)?.getTime() ?? Number.POSITIVE_INFINITY)
  )
  const isSoon = Number.isFinite(nearestTime) && beijingDayDifference(nearestTime, now) <= 3

  if (exams.length === 1) return isSoon ? "exams.messageOneSoon" : "exams.messageOneLater"
  if (exams.length === 2) return isSoon ? "exams.messageTwoSoon" : "exams.messageTwoLater"
  return isSoon ? "exams.messageManySoon" : "exams.messageManyLater"
}

export function recentSemesterCodes(currentTerm: string | undefined, count = 8): string[] {
  if (!currentTerm || count <= 0) return []
  const match = /^(\d{4})-(\d{4})-([12])$/.exec(currentTerm)
  if (!match) return [currentTerm]

  let year = Number(match[1])
  if (Number(match[2]) !== year + 1) return [currentTerm]
  let semester = Number(match[3])
  const terms: string[] = []

  for (let index = 0; index < count; index += 1) {
    terms.push(`${year}-${year + 1}-${semester}`)
    if (semester === 1) {
      year -= 1
      semester = 2
    } else {
      semester = 1
    }
  }
  return terms
}

export function formatExamTime(exam: Exam): string {
  const start = formatTimeFromDateTime(exam.startAt)
  const end = formatTimeFromDateTime(exam.endAt)
  const time = exam.timeText || (start && end ? `${start}-${end}` : start || end || "")
  const date = exam.startAt?.slice(0, 10) || exam.endAt?.slice(0, 10) || ""
  if (!date || !time || /\d{4}[-/.年]\d{1,2}/.test(time)) return time || date
  return `${date} ${time}`
}
