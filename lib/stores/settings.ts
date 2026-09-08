import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { migrateLocalStorageKey, STORAGE_KEYS } from "../storage/keys"

migrateLocalStorageKey(STORAGE_KEYS.settings, STORAGE_KEYS.legacySettings)

export type CardStyle = "solid" | "translucent" | "glass"
export type BackgroundStyle = "overlay" | "blur-overlay"
export type LandingPage = "overview" | "schedule"

interface SettingsState {
  backgroundImage: string
  backgroundOverlayOpacity: number
  backgroundStyle: BackgroundStyle
  backgroundBlurAmount: number
  cardStyle: CardStyle
  cardOpacity: number
  defaultLandingPage: LandingPage
  widgetSyncReminderHours: number
  widgetShowNextDaySchedule: boolean
  avatarImage: string
  customUserAgent: string
  customUserAgentEnabled: boolean
  customCerBaseUrl: string
  customJwxtBaseUrl: string
  schoolId: string
  scheduleCompactMode: boolean
  gpaVisible: boolean
  notifyEnabled: boolean
  notifyCheckInterval: number
  notifyGrades: boolean
  notifyExams: boolean
  notifyNetworkError: boolean
  classReminderEnabled: boolean
  classReminderMinutes: number
  classReminderDays: number
  hasHydrated: boolean
  setBackgroundImage: (image: string) => void
  setBackgroundOverlayOpacity: (opacity: number) => void
  setBackgroundStyle: (style: BackgroundStyle) => void
  setBackgroundBlurAmount: (amount: number) => void
  setCardStyle: (style: CardStyle) => void
  setCardOpacity: (opacity: number) => void
  setDefaultLandingPage: (page: LandingPage) => void
  setWidgetSyncReminderHours: (hours: number) => void
  setWidgetShowNextDaySchedule: (v: boolean) => void
  setAvatarImage: (image: string) => void
  setCustomUserAgent: (ua: string) => void
  setCustomUserAgentEnabled: (v: boolean) => void
  setCustomCerBaseUrl: (url: string) => void
  setCustomJwxtBaseUrl: (url: string) => void
  setSchoolId: (id: string) => void
  setScheduleCompactMode: (v: boolean) => void
  setGpaVisible: (v: boolean) => void
  setNotifyEnabled: (v: boolean) => void
  setNotifyCheckInterval: (v: number) => void
  setNotifyGrades: (v: boolean) => void
  setNotifyExams: (v: boolean) => void
  setNotifyNetworkError: (v: boolean) => void
  setClassReminderEnabled: (v: boolean) => void
  setClassReminderMinutes: (v: number) => void
  setClassReminderDays: (v: number) => void
  setHasHydrated: (v: boolean) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      backgroundImage: "",
      backgroundOverlayOpacity: 75,
      backgroundStyle: "overlay",
      backgroundBlurAmount: 20,
      cardStyle: "solid",
      cardOpacity: 100,
      defaultLandingPage: "schedule",
      widgetSyncReminderHours: 24,
      widgetShowNextDaySchedule: false,
      avatarImage: "",
      customUserAgent: "",
      customUserAgentEnabled: false,
      customCerBaseUrl: "",
      customJwxtBaseUrl: "",
      schoolId: "ysu",
      scheduleCompactMode: false,
      gpaVisible: false,
      notifyEnabled: false,
      notifyCheckInterval: 60,
      notifyGrades: true,
      notifyExams: true,
      notifyNetworkError: false,
      classReminderEnabled: false,
      classReminderMinutes: 15,
      classReminderDays: 7,
      hasHydrated: false,
      setBackgroundImage: (backgroundImage) => set({ backgroundImage }),
      setBackgroundOverlayOpacity: (backgroundOverlayOpacity) => set({ backgroundOverlayOpacity }),
      setBackgroundStyle: (backgroundStyle) => set({ backgroundStyle }),
      setBackgroundBlurAmount: (backgroundBlurAmount) => set({ backgroundBlurAmount }),
      setCardStyle: (cardStyle) => set({ cardStyle }),
      setCardOpacity: (cardOpacity) => set({ cardOpacity }),
      setDefaultLandingPage: (defaultLandingPage) => set({ defaultLandingPage }),
      setWidgetSyncReminderHours: (widgetSyncReminderHours) => set({ widgetSyncReminderHours }),
      setWidgetShowNextDaySchedule: (widgetShowNextDaySchedule) =>
        set({ widgetShowNextDaySchedule }),
      setAvatarImage: (avatarImage) => set({ avatarImage }),
      setCustomUserAgent: (customUserAgent) => set({ customUserAgent }),
      setCustomUserAgentEnabled: (customUserAgentEnabled) => set({ customUserAgentEnabled }),
      setCustomCerBaseUrl: (customCerBaseUrl) => set({ customCerBaseUrl }),
      setCustomJwxtBaseUrl: (customJwxtBaseUrl) => set({ customJwxtBaseUrl }),
      setSchoolId: (schoolId) => set({ schoolId }),
      setScheduleCompactMode: (scheduleCompactMode) => set({ scheduleCompactMode }),
      setGpaVisible: (gpaVisible) => set({ gpaVisible }),
      setNotifyEnabled: (notifyEnabled) => set({ notifyEnabled }),
      setNotifyCheckInterval: (notifyCheckInterval) => set({ notifyCheckInterval }),
      setNotifyGrades: (notifyGrades) => set({ notifyGrades }),
      setNotifyExams: (notifyExams) => set({ notifyExams }),
      setNotifyNetworkError: (notifyNetworkError) => set({ notifyNetworkError }),
      setClassReminderEnabled: (classReminderEnabled) => set({ classReminderEnabled }),
      setClassReminderMinutes: (classReminderMinutes) => set({ classReminderMinutes }),
      setClassReminderDays: (classReminderDays) => set({ classReminderDays }),
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: STORAGE_KEYS.settings,
      storage: createJSONStorage(() => localStorage),
      version: 1,
      migrate: (persistedState, version) => ({
        ...(persistedState as SettingsState),
        ...(version < 1 ? { defaultLandingPage: "schedule" as LandingPage } : {}),
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
