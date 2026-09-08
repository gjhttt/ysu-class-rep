import type { Grade } from "@/providers/types"

export function numericGradeValue(
  value: number | undefined,
  fallback?: string
): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value
  const parsed = Number(fallback)
  return Number.isFinite(parsed) ? parsed : undefined
}

export function sortSemestersNewestFirst(semesters: readonly string[]): string[] {
  return [...semesters].sort((a, b) => {
    const left = a.match(/\d+/g)?.map(Number) ?? []
    const right = b.match(/\d+/g)?.map(Number) ?? []
    const length = Math.max(left.length, right.length)
    for (let index = 0; index < length; index += 1) {
      const difference = (right[index] ?? -1) - (left[index] ?? -1)
      if (difference !== 0) return difference
    }
    return b.localeCompare(a, "zh-CN")
  })
}

export function calculateTermWeightedGpa(grades: readonly Grade[]): string | null {
  let weightedPoints = 0
  let weightedCredits = 0

  for (const grade of grades) {
    if (!grade.isMajor || grade.isRetake !== "正考") continue
    const point = numericGradeValue(grade.numericGradePoint, grade.gradePoint)
    const credit = numericGradeValue(grade.numericCredit, grade.credit)
    if (point === undefined || credit === undefined || credit <= 0) continue
    const weight = grade.isDegreeCourse ? 1.2 : 1
    weightedPoints += point * credit * weight
    weightedCredits += credit * weight
  }

  return weightedCredits > 0 ? (weightedPoints / weightedCredits).toFixed(4) : null
}
