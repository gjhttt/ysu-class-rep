import { describe, expect, it } from "vitest"
import { isTrustedApkUrl, releaseToUpdateInfo } from "./updater"

describe("releaseToUpdateInfo", () => {
  it("只接受版本更高且带有 APK 的正式发布", () => {
    expect(
      releaseToUpdateInfo(
        {
          tag_name: "v1.2.0",
          body: "更新说明",
          assets: [
            {
              name: "ysu-class-rep.apk",
              browser_download_url:
                "https://github.com/GJHTTT/ysu-class-rep/releases/download/v1.2.0/app.apk",
            },
          ],
        },
        "1.1.0"
      )
    ).toMatchObject({ available: true, version: "1.2.0", apkUpdateAvailable: true })

    expect(releaseToUpdateInfo({ tag_name: "v1.1.0", assets: [] }, "1.1.0").available).toBe(
      false
    )
    expect(
      releaseToUpdateInfo({ tag_name: "v1.2.0", prerelease: true, assets: [] }, "1.1.0")
        .available
    ).toBe(false)
  })
})

describe("isTrustedApkUrl", () => {
  it("接受 GitHub 返回的仓库地址大小写并拒绝其他来源", () => {
    expect(
      isTrustedApkUrl(
        "https://github.com/gjhttt/ysu-class-rep/releases/download/v0.1.1/app.apk"
      )
    ).toBe(true)
    expect(
      isTrustedApkUrl(
        "https://github.com/GJHTTT/YSU-Class-Rep/releases/download/v0.1.1/app.apk"
      )
    ).toBe(true)
    expect(isTrustedApkUrl("https://example.com/app.apk")).toBe(false)
  })
})
