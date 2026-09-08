"use client"

import { useEffect } from "react"
import { toast } from "sonner"
import { initializeActiveProvider, setActiveProviderSchool } from "@/providers/provider-service"
import { useProviderContext } from "@/providers/provider-context"
import { useAuthStore } from "@/lib/stores/auth"
import { useSettingsStore } from "@/lib/stores/settings"
import { useTranslation } from "@/lib/i18n/use-translation"
import { isCapacitor } from "@/lib/native/platform"
import { initSafeArea } from "@/lib/native/webview-compat"
import { checkAnnouncement } from "@/lib/announcement"
import { checkForUpdate } from "@/lib/updater"
import { useAnnouncementStore } from "@/lib/stores/announcement"
import { useUpdateStore } from "@/lib/stores/update"
import { AnnouncementDialog } from "@/components/announcement-dialog"
import { UpdateDialog } from "@/components/update-dialog"

export function StudySDKProvider({ children }: { children: React.ReactNode }) {
  const { t } = useTranslation()
  const hasHydrated = useAuthStore((state) => state.hasHydrated)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const settingsHydrated = useSettingsStore((state) => state.hasHydrated)
  const schoolId = useSettingsStore((state) => state.schoolId)
  const { markProviderInitializing, markProviderReady, markProviderError } = useProviderContext()

  useEffect(() => {
    if (!isCapacitor()) return
    const inject = () => void initSafeArea().catch(() => {})
    inject()
    window.addEventListener("resize", inject)
    return () => window.removeEventListener("resize", inject)
  }, [])

  useEffect(() => {
    if (!settingsHydrated || !isCapacitor()) return
    let cancelled = false

    void Promise.all([
      checkAnnouncement().catch(() => null),
      checkForUpdate(true).catch(() => null),
    ]).then(([announcement, update]) => {
      if (cancelled) return
      if (update?.available) {
        useUpdateStore.getState().setUpdateInfo(update)
        useUpdateStore.getState().setUpdateStatus(true)
      }
      if (announcement) {
        useAnnouncementStore.getState().setAnnouncementInfo(announcement)
        useAnnouncementStore.getState().setShowDialog(true)
      } else if (update?.available) {
        useUpdateStore.getState().setShowDialog(true)
      }
    })

    return () => {
      cancelled = true
    }
  }, [settingsHydrated])

  useEffect(() => {
    if (!hasHydrated || !settingsHydrated) return

    let cancelled = false
    markProviderInitializing()
    setActiveProviderSchool(schoolId)

    initializeActiveProvider()
      .then(async (provider) => {
        if (cancelled) return
        markProviderReady(provider)
        if (!isAuthenticated) return

        let status = await provider.checkAuthStatus()
        if (!status.authenticated) {
          await new Promise((resolve) => setTimeout(resolve, 800))
          status = await provider.checkAuthStatus()
        }
        if (cancelled) return
        useAuthStore.getState().setSessionExpired(!status.authenticated)
        if (!status.authenticated) toast.error(t("app.sessionExpired"))
      })
      .catch((error) => {
        if (!cancelled) markProviderError(error)
      })

    return () => {
      cancelled = true
    }
  }, [
    hasHydrated,
    isAuthenticated,
    markProviderError,
    markProviderInitializing,
    markProviderReady,
    schoolId,
    settingsHydrated,
    t,
  ])

  if (!hasHydrated || !settingsHydrated) {
    return (
      <div className="flex min-h-svh items-center justify-center text-muted-foreground">
        {t("app.updating")}
      </div>
    )
  }

  return (
    <>
      {children}
      <AnnouncementDialog
        onDismissed={() => {
          if (useUpdateStore.getState().hasUpdate) {
            useUpdateStore.getState().setShowDialog(true)
          }
        }}
      />
      <UpdateDialog />
    </>
  )
}
