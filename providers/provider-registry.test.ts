import { describe, expect, it, vi } from "vitest"

vi.mock("@/lib/app-config", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/app-config")>()),
  IS_MOCK_MODE: true,
}))
vi.mock("@/lib/native/platform", () => ({ isCapacitor: () => true }))

import { MockYSUProvider } from "./mock/runtime"
import { createProvider } from "./provider-registry"

describe("provider registry", () => {
  it("never enables the mock provider inside an Android build", () => {
    expect(createProvider("ysu")).not.toBeInstanceOf(MockYSUProvider)
  })

  it("enables the verified read-only school schedule queries", () => {
    expect(createProvider("ysu").capabilities.schoolSchedule).toBe(true)
  })
})
