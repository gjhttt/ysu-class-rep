import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import { secureStorage } from "../storage/secure"
import { STORAGE_KEYS } from "../storage/keys"

interface AuthState {
  credential: string | null
  jwxtSession: string | null
  mobileSession: string | null
  username: string | null
  cacheNamespace: string | null
  isAuthenticated: boolean
  sessionExpired: boolean
  hasHydrated: boolean
  setCredential: (credential: string, username?: string) => void
  setJWXTSession: (session: string) => void
  setMobileSession: (session: string) => void
  setSessionExpired: (expired: boolean) => void
  clearCredential: () => void
  setHasHydrated: (v: boolean) => void
}

function createCacheNamespace(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("")
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      credential: null,
      jwxtSession: null,
      mobileSession: null,
      username: null,
      cacheNamespace: null,
      isAuthenticated: false,
      sessionExpired: false,
      hasHydrated: false,
      setCredential: (credential, username) =>
        set((state) => {
          const nextUsername = username ?? state.username
          return {
            credential,
            username: nextUsername,
            cacheNamespace:
              nextUsername && nextUsername === state.username && state.cacheNamespace
                ? state.cacheNamespace
                : createCacheNamespace(),
            isAuthenticated: true,
            sessionExpired: false,
            jwxtSession: null,
            mobileSession: null,
          }
        }),
      setJWXTSession: (jwxtSession) => set({ jwxtSession }),
      setMobileSession: (mobileSession) => set({ mobileSession }),
      setSessionExpired: (sessionExpired) => set({ sessionExpired }),
      clearCredential: () =>
        set({
          credential: null,
          jwxtSession: null,
          mobileSession: null,
          username: null,
          cacheNamespace: null,
          isAuthenticated: false,
          sessionExpired: false,
        }),
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: STORAGE_KEYS.auth,
      storage: createJSONStorage(() => secureStorage),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
