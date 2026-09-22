import { APP_CONFIG } from "@/lib/app-config"
import type { DegreeStatus, PredictionDraft, RoundingMode } from "@/lib/academic/gpa-predictor"

const PREFIX = `${APP_CONFIG.storagePrefix}-gpa-predictor:`
const VERSION = 1

export interface CourseIdentityInput {
  semester: string
  courseCode?: string
  classId?: string
  manualId?: string
}

export interface CourseProfile {
  id: string
  name: string
  semester: string
  courseCode?: string
  classId?: string
  originalCredit?: number
  overrideCredit?: number
  degreeStatus: DegreeStatus
  degreeSource?: "official" | "user" | "unknown"
  source: "grade" | "schedule" | "custom"
  custom?: boolean
  schedule?: {
    weekDay: number
    startSection: number
    endSection: number
    weeks: string
    classroom?: string
    teacher?: string
  }
}

export interface CoursePrediction {
  included: boolean
  draft: PredictionDraft
}

export interface PredictionScenario {
  id: string
  name: string
  predictions: Record<string, CoursePrediction>
  createdAt: number
  updatedAt: number
}

export interface GpaPredictorData {
  version: number
  rounding: RoundingMode
  targetGpa?: number
  activeScenarioId: string
  profiles: Record<string, CourseProfile>
  scenarios: PredictionScenario[]
}

function id(): string {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
}

export function clonePredictionData<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

function newScenario(name = "默认方案"): PredictionScenario {
  const now = Date.now()
  return { id: id(), name, predictions: {}, createdAt: now, updatedAt: now }
}

export function emptyPredictorData(): GpaPredictorData {
  const scenario = newScenario()
  return {
    version: VERSION,
    rounding: "exact",
    activeScenarioId: scenario.id,
    profiles: {},
    scenarios: [scenario],
  }
}

export function courseEntityId(input: CourseIdentityInput): string | null {
  const semester = input.semester.trim()
  if (!semester) return null
  if (input.manualId?.trim()) return `${semester}|manual:${input.manualId.trim()}`
  if (input.courseCode?.trim()) return `${semester}|code:${input.courseCode.trim()}`
  if (input.classId?.trim()) return `${semester}|class:${input.classId.trim()}`
  return null
}

export function effectiveCredit(profile: CourseProfile): number | undefined {
  return profile.overrideCredit ?? profile.originalCredit
}

export function loadGpaPredictorData(accountScope: string): GpaPredictorData {
  if (typeof localStorage === "undefined") return emptyPredictorData()
  try {
    const parsed = JSON.parse(localStorage.getItem(`${PREFIX}${accountScope}`) ?? "null")
    if (parsed?.version === VERSION && Array.isArray(parsed.scenarios)) return parsed
  } catch {
    // Fall through to a clean local state.
  }
  return emptyPredictorData()
}

export function saveGpaPredictorData(accountScope: string, data: GpaPredictorData): void {
  if (typeof localStorage === "undefined") return
  localStorage.setItem(`${PREFIX}${accountScope}`, JSON.stringify(data))
  window.dispatchEvent(new CustomEvent("ysu-gpa-predictor-change"))
}

export function clearGpaPredictorData(): void {
  if (typeof localStorage === "undefined") return
  const keys: string[] = []
  for (let index = 0; index < localStorage.length; index += 1) {
    const key = localStorage.key(index)
    if (key?.startsWith(PREFIX)) keys.push(key)
  }
  keys.forEach((key) => localStorage.removeItem(key))
}
