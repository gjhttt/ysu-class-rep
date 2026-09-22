import type { Course, Grade } from "@/providers/types"
import { courseEntityId, type CourseProfile } from "@/lib/storage/gpa-predictor"

function number(value: number | undefined, fallback?: string): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value
  const parsed = Number(fallback)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined
}

export function mergeCourseProfiles(
  existing: Record<string, CourseProfile>,
  grades: readonly Grade[],
  schedule: readonly Course[],
  scheduleSemester: string
): Record<string, CourseProfile> {
  const profiles = { ...existing }

  for (const course of schedule) {
    const manualId = typeof course.raw?.id === "string" ? course.raw.id : undefined
    const id = courseEntityId({
      semester: scheduleSemester,
      courseCode: course.code,
      classId: course.classId,
      manualId,
    })
    if (!id) continue
    const previous = profiles[id]
    profiles[id] = {
      id,
      name: course.name || previous?.name || "未命名课程",
      semester: scheduleSemester,
      courseCode: course.code || previous?.courseCode,
      classId: course.classId || previous?.classId,
      originalCredit: number(undefined, course.credit) ?? previous?.originalCredit,
      overrideCredit: previous?.overrideCredit,
      degreeStatus: previous?.degreeStatus ?? "unknown",
      degreeSource: previous?.degreeSource ?? "unknown",
      source: previous?.source === "custom" ? "custom" : "schedule",
      custom: previous?.custom ?? manualId !== undefined,
    }
  }

  for (const grade of grades) {
    const semester = grade.semester?.trim()
    if (!semester) continue
    const id = courseEntityId({
      semester,
      courseCode: grade.courseCode,
      classId: grade.classId,
    })
    if (!id) continue
    const previous = profiles[id]
    profiles[id] = {
      id,
      name: grade.courseName || previous?.name || "未命名课程",
      semester,
      courseCode: grade.courseCode || previous?.courseCode,
      classId: grade.classId || previous?.classId,
      originalCredit: number(grade.numericCredit, grade.credit) ?? previous?.originalCredit,
      overrideCredit: previous?.overrideCredit,
      degreeStatus:
        previous?.degreeSource === "user"
          ? previous.degreeStatus
          : grade.isDegreeCourse
            ? "degree"
            : "non-degree",
      degreeSource: previous?.degreeSource === "user" ? "user" : "official",
      source: previous?.source === "custom" ? "custom" : "grade",
      custom: previous?.custom,
    }
  }

  return profiles
}

export function gradeEntityId(grade: Grade): string | null {
  return courseEntityId({
    semester: grade.semester ?? "",
    courseCode: grade.courseCode,
    classId: grade.classId,
  })
}
