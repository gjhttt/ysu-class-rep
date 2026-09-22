import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import {
  clearGpaPredictorData,
  emptyPredictorData,
  loadGpaPredictorData,
  saveGpaPredictorData,
} from "./gpa-predictor"

class MemoryStorage implements Storage {
  private readonly values = new Map<string, string>()

  get length() {
    return this.values.size
  }

  clear() {
    this.values.clear()
  }

  getItem(key: string) {
    return this.values.get(key) ?? null
  }

  key(index: number) {
    return [...this.values.keys()][index] ?? null
  }

  removeItem(key: string) {
    this.values.delete(key)
  }

  setItem(key: string, value: string) {
    this.values.set(key, value)
  }
}

describe("GPA predictor storage", () => {
  beforeEach(() => {
    vi.stubGlobal("localStorage", new MemoryStorage())
    vi.stubGlobal("window", { dispatchEvent: vi.fn() })
    vi.stubGlobal(
      "CustomEvent",
      class {
        constructor(readonly type: string) {}
      }
    )
  })

  afterEach(() => vi.unstubAllGlobals())

  it("persists local corrections after reload and isolates accounts", () => {
    const first = emptyPredictorData()
    first.profiles.course = {
      id: "course",
      name: "大学物理",
      semester: "2026-2027-1",
      originalCredit: 3,
      overrideCredit: 3.5,
      degreeStatus: "unknown",
      source: "schedule",
    }
    saveGpaPredictorData("account-a", first)

    expect(loadGpaPredictorData("account-a").profiles.course?.overrideCredit).toBe(3.5)
    expect(loadGpaPredictorData("account-b").profiles.course).toBeUndefined()
  })

  it("clears every account-scoped predictor cache on logout", () => {
    saveGpaPredictorData("account-a", emptyPredictorData())
    saveGpaPredictorData("account-b", emptyPredictorData())
    clearGpaPredictorData()

    expect(localStorage.length).toBe(0)
  })
})
