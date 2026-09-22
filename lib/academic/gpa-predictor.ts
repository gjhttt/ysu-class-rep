export type DegreeStatus = "degree" | "non-degree" | "unknown"
export type ScoreInputKind = "raw" | "contribution"
export type PredictionMode = "components" | "grade"
export type RoundingMode = "nearest" | "floor" | "ceil" | "exact"

export interface ScorePart {
  kind: ScoreInputKind
  score?: number
  maxScore?: number
  weight: number
}

export interface PredictionDraft {
  mode: PredictionMode
  regular: ScorePart
  final: ScorePart
  gradeLevel?: string
}

export interface WeightedCourse {
  point: number
  credit: number
  degreeStatus: DegreeStatus
}

export const GPA_LEVELS = [
  { level: "A+", min: 97, max: 100, point: 4.5 },
  { level: "A", min: 93, max: 96, point: 4.3 },
  { level: "A-", min: 89, max: 92, point: 4.0 },
  { level: "B+", min: 85, max: 88, point: 3.8 },
  { level: "B", min: 81, max: 84, point: 3.4 },
  { level: "B-", min: 77, max: 80, point: 3.0 },
  { level: "C+", min: 73, max: 76, point: 2.6 },
  { level: "C", min: 69, max: 72, point: 2.2 },
  { level: "C-", min: 65, max: 68, point: 1.8 },
  { level: "D+", min: 60, max: 64, point: 1.5 },
  { level: "F", min: 40, max: 59, point: 0 },
  { level: "F-", min: 0, max: 39, point: 0 },
] as const

export function partContribution(part: ScorePart): number | null {
  if (part.weight < 0 || part.weight > 1 || part.score === undefined) return null
  if (part.kind === "contribution") {
    return part.score >= 0 && part.score <= part.weight * 100 ? part.score : null
  }
  if (!part.maxScore || part.maxScore <= 0 || part.score < 0 || part.score > part.maxScore) {
    return null
  }
  return (part.score / part.maxScore) * part.weight * 100
}

export function courseTotal(draft: PredictionDraft): number | null {
  if (draft.mode !== "components") return null
  if (Math.abs(draft.regular.weight + draft.final.weight - 1) > 1e-9) return null
  const regular = partContribution(draft.regular)
  if (regular === null) return null
  if (draft.final.weight === 0) return regular
  const final = partContribution(draft.final)
  return final === null ? null : regular + final
}

export function roundedScore(score: number, mode: RoundingMode): number | null {
  if (!Number.isFinite(score)) return null
  if (mode === "nearest") return Math.round(score)
  if (mode === "floor") return Math.floor(score)
  if (mode === "ceil") return Math.ceil(score)
  return Number.isInteger(score) ? score : null
}

export function levelForScore(score: number, mode: RoundingMode) {
  const value = roundedScore(score, mode)
  if (value === null || value < 0 || value > 100) return null
  return GPA_LEVELS.find((item) => value >= item.min && value <= item.max) ?? null
}

export function scoreThresholdForLevel(minimumIntegerScore: number, mode: RoundingMode): number {
  if (mode === "nearest") return Math.max(0, minimumIntegerScore - 0.5)
  if (mode === "ceil") return Math.max(0, minimumIntegerScore - 1)
  return minimumIntegerScore
}

export function predictionPoint(draft: PredictionDraft, rounding: RoundingMode): number | null {
  if (draft.mode === "grade") {
    return GPA_LEVELS.find((item) => item.level === draft.gradeLevel)?.point ?? null
  }
  const total = courseTotal(draft)
  return total === null ? null : (levelForScore(total, rounding)?.point ?? null)
}

export function degreeWeight(status: DegreeStatus): number | null {
  if (status === "degree") return 1.2
  if (status === "non-degree") return 1
  return null
}

export function weightedSummary(courses: readonly WeightedCourse[]) {
  let points = 0
  let credits = 0
  for (const course of courses) {
    const weight = degreeWeight(course.degreeStatus)
    if (weight === null || course.credit <= 0 || !Number.isFinite(course.point)) continue
    points += course.point * course.credit * weight
    credits += course.credit * weight
  }
  return { points, credits, gpa: credits > 0 ? points / credits : null }
}

export function requiredFutureAverage(
  points: number,
  credits: number,
  futureCredits: number,
  target: number
): number | null {
  if (futureCredits <= 0) return null
  return (target * (credits + futureCredits) - points) / futureCredits
}

export function minimumLevelForTarget(
  fixedPoints: number,
  fixedCredits: number,
  credit: number,
  status: DegreeStatus,
  target: number
) {
  const weight = degreeWeight(status)
  if (weight === null || credit <= 0) return null
  return (
    [...GPA_LEVELS]
      .reverse()
      .find(
        (level) =>
          (fixedPoints + level.point * credit * weight) / (fixedCredits + credit * weight) >= target
      ) ?? null
  )
}

export function requiredFinalRawScore(
  draft: PredictionDraft,
  requiredTotal: number
): number | null {
  if (draft.mode !== "components" || draft.final.weight <= 0) return null
  const regular = partContribution(draft.regular)
  if (regular === null) return null
  const neededContribution = requiredTotal - regular
  if (neededContribution < 0) return 0
  if (neededContribution > draft.final.weight * 100) return null
  if (draft.final.kind === "contribution") return neededContribution
  if (!draft.final.maxScore || draft.final.maxScore <= 0) return null
  return (neededContribution / (draft.final.weight * 100)) * draft.final.maxScore
}
