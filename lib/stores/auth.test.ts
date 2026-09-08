import { beforeEach, describe, expect, it } from "vitest"
import { useAuthStore } from "./auth"

describe("auth cache namespace", () => {
  beforeEach(() => useAuthStore.getState().clearCredential())

  it("keeps one opaque namespace per account and clears it on logout", () => {
    useAuthStore.getState().setCredential("credential-1", "student-a")
    const first = useAuthStore.getState().cacheNamespace

    expect(first).toMatch(/^[0-9a-f]{32}$/)
    expect(first).not.toContain("student-a")

    useAuthStore.getState().setCredential("credential-2", "student-a")
    expect(useAuthStore.getState().cacheNamespace).toBe(first)

    useAuthStore.getState().setCredential("credential-3", "student-b")
    expect(useAuthStore.getState().cacheNamespace).not.toBe(first)

    useAuthStore.getState().clearCredential()
    expect(useAuthStore.getState().cacheNamespace).toBeNull()
  })
})
