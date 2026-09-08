import type { CapacitorConfig } from "@capacitor/cli"
import { APP_CONFIG } from "./lib/app-config"

const config: CapacitorConfig = {
  appId: APP_CONFIG.androidPackage,
  appName: APP_CONFIG.appName,
  webDir: "dist",
  loggingBehavior: "none",
  includePlugins: [
    "@aparajita/capacitor-secure-storage",
    "@capacitor/app",
    "@capacitor/device",
    "@capacitor/filesystem",
  ],
  plugins: {
    CapacitorHttp: {
      enabled: true,
    },
  },
}

export default config
