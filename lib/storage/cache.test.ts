import { describe, expect, it } from "vitest"
import { stripCacheMetadata } from "./cache"

describe("stripCacheMetadata", () => {
  it("removes raw protocol fields without changing display data", () => {
    expect(
      stripCacheMetadata({
        courseName: "测试课程",
        metadata: { XH: "private" },
        rows: [{ score: 95, raw: { XH: "private" } }],
      })
    ).toEqual({ courseName: "测试课程", rows: [{ score: 95 }] })
  })
})
