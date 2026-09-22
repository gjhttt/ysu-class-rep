import { describe, expect, it } from "vitest"
import {
  courseTotal,
  levelForScore,
  minimumLevelForTarget,
  predictionPoint,
  requiredFinalRawScore,
  requiredFutureAverage,
  scoreThresholdForLevel,
  weightedSummary,
  type PredictionDraft,
} from "./gpa-predictor"

function components(
  regular: PredictionDraft["regular"],
  final: PredictionDraft["final"]
): PredictionDraft {
  return { mode: "components", regular, final }
}

describe("GPA prediction", () => {
  it("calculates all documented score inputs as 83 and 3.4", () => {
    const samples = [
      components(
        { kind: "raw", score: 90, maxScore: 100, weight: 0.3 },
        { kind: "raw", score: 80, maxScore: 100, weight: 0.7 }
      ),
      components(
        { kind: "raw", score: 18, maxScore: 20, weight: 0.3 },
        { kind: "raw", score: 120, maxScore: 150, weight: 0.7 }
      ),
      components(
        { kind: "contribution", score: 27, weight: 0.3 },
        { kind: "contribution", score: 56, weight: 0.7 }
      ),
    ]
    for (const sample of samples) {
      expect(courseTotal(sample)).toBe(83)
      expect(predictionPoint(sample, "nearest")).toBe(3.4)
    }
  })

  it("keeps missing grades pending and handles 100% regular work", () => {
    expect(
      courseTotal(
        components(
          { kind: "raw", score: 90, maxScore: 100, weight: 0.3 },
          { kind: "raw", weight: 0.7 }
        )
      )
    ).toBeNull()
    expect(
      courseTotal(
        components({ kind: "contribution", score: 83, weight: 1 }, { kind: "raw", weight: 0 })
      )
    ).toBe(83)
  })

  it("uses only the active prediction mode", () => {
    const draft = components(
      { kind: "contribution", score: 27, weight: 0.3 },
      { kind: "contribution", score: 56, weight: 0.7 }
    )
    expect(predictionPoint({ ...draft, mode: "grade", gradeLevel: "A" }, "exact")).toBe(4.3)
  })

  it("calculates weighted GPA with and without the degree-course weight", () => {
    expect(
      weightedSummary([
        { point: 4, credit: 5, degreeStatus: "non-degree" },
        { point: 4.5, credit: 3, degreeStatus: "non-degree" },
      ]).gpa
    ).toBe(4.1875)
    expect(
      weightedSummary([
        { point: 4, credit: 5, degreeStatus: "degree" },
        { point: 4.5, credit: 3, degreeStatus: "non-degree" },
      ]).gpa
    ).toBeCloseTo(37.5 / 9)
    expect(weightedSummary([{ point: 4, credit: 5, degreeStatus: "unknown" }]).gpa).toBeNull()
    expect(weightedSummary([]).gpa).toBeNull()
  })

  it("does not silently classify decimal scores without a chosen rounding rule", () => {
    expect(levelForScore(88.6, "exact")).toBeNull()
    expect(levelForScore(88.6, "nearest")?.level).toBe("A-")
    expect(scoreThresholdForLevel(89, "nearest")).toBe(88.5)
  })

  it("reverses reachable targets and final-exam thresholds", () => {
    expect(requiredFutureAverage(20, 5, 3, 4)).toBe(4)
    expect(requiredFutureAverage(20, 5, 0, 4)).toBeNull()
    expect(minimumLevelForTarget(20, 5, 3, "non-degree", 4)?.level).toBe("A-")
    expect(
      requiredFinalRawScore(
        components(
          { kind: "contribution", score: 27, weight: 0.3 },
          { kind: "raw", maxScore: 150, weight: 0.7 }
        ),
        83
      )
    ).toBe(120)
  })
})
