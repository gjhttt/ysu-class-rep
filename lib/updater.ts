import { App } from "@capacitor/app"
import { registerPlugin } from "@capacitor/core"
import { clean, gt, valid } from "semver"
import { APP_CONFIG } from "@/lib/app-config"
import { STORAGE_KEYS } from "@/lib/storage/keys"
import { APP_VERSION } from "@/lib/version"
import { isCapacitor } from "@/lib/native/platform"

export interface UpdateInfo {
  available: boolean
  version: string
  body: string
  apkUpdateAvailable: boolean
  apkDownloadUrl: string
}

interface GitHubAsset {
  name?: string
  browser_download_url?: string
}

export interface GitHubRelease {
  tag_name?: string
  body?: string
  draft?: boolean
  prerelease?: boolean
  html_url?: string
  assets?: GitHubAsset[]
}

const CHECK_COOLDOWN_MS = 30 * 60 * 1000

const EMPTY_UPDATE: UpdateInfo = {
  available: false,
  version: "",
  body: "",
  apkUpdateAvailable: false,
  apkDownloadUrl: "",
}

function normalizeVersion(version: string): string | null {
  const withoutPrefix = version.trim().replace(/^v/i, "")
  return valid(withoutPrefix) ?? clean(withoutPrefix) ?? null
}

export function releaseToUpdateInfo(release: GitHubRelease, currentVersion: string): UpdateInfo {
  if (release.draft || release.prerelease) return EMPTY_UPDATE
  const current = normalizeVersion(currentVersion)
  const target = normalizeVersion(release.tag_name ?? "")
  if (!current || !target || !gt(target, current)) return EMPTY_UPDATE

  const apk = release.assets?.find(
    (asset) => asset.name?.toLowerCase().endsWith(".apk") && asset.browser_download_url
  )
  if (!apk?.browser_download_url) return EMPTY_UPDATE

  return {
    available: true,
    version: target,
    body: release.body ?? "",
    apkUpdateAvailable: true,
    apkDownloadUrl: apk.browser_download_url,
  }
}

export function isTrustedApkUrl(url: string): boolean {
  return url.toLowerCase().startsWith("https://github.com/gjhttt/ysu-class-rep/")
}

export async function checkForUpdate(auto = false): Promise<UpdateInfo> {
  if (!isCapacitor()) return EMPTY_UPDATE
  if (auto) {
    const lastCheck = Number(localStorage.getItem(STORAGE_KEYS.lastUpdateCheck) ?? 0)
    if (Date.now() - lastCheck < CHECK_COOLDOWN_MS) return EMPTY_UPDATE
  }

  const response = await fetch(APP_CONFIG.releasesApiUrl, {
    headers: { Accept: "application/vnd.github+json" },
  })
  if (response.status === 404) return EMPTY_UPDATE
  if (!response.ok) throw new Error(`GitHub HTTP ${response.status}`)

  if (auto) localStorage.setItem(STORAGE_KEYS.lastUpdateCheck, String(Date.now()))
  const release = (await response.json()) as GitHubRelease
  const installedVersion = (await App.getInfo()).version || APP_VERSION
  return releaseToUpdateInfo(release, installedVersion)
}

interface YsuFilePlugin {
  downloadApk(options: { url: string; fileName?: string }): Promise<{ path: string }>
  installApk(options: { path: string }): Promise<void>
  ensureInstallPermission(): Promise<{ allowed: boolean }>
  addListener(
    eventName: "downloadProgress",
    listener: (state: { percent: number }) => void
  ): Promise<{ remove: () => void }>
}

const YsuFile = registerPlugin<YsuFilePlugin>("YsuFile")
let downloadedApkPath: string | null = null

export async function downloadApkInApp(
  info: UpdateInfo,
  onProgress?: (percent: number) => void
): Promise<void> {
  if (!isTrustedApkUrl(info.apkDownloadUrl)) {
    throw new Error("Untrusted APK source")
  }
  const listener = await YsuFile.addListener("downloadProgress", (state) => {
    onProgress?.(state.percent)
  })
  try {
    const result = await YsuFile.downloadApk({
      url: info.apkDownloadUrl,
      fileName: `ysu-class-rep-${info.version}.apk`,
    })
    downloadedApkPath = result.path
  } finally {
    await listener.remove()
  }
}

export async function installDownloadedApk(): Promise<"launched" | "permission-required"> {
  if (!downloadedApkPath) throw new Error("No APK downloaded")
  const permission = await YsuFile.ensureInstallPermission()
  if (!permission.allowed) return "permission-required"
  await YsuFile.installApk({ path: downloadedApkPath })
  return "launched"
}
