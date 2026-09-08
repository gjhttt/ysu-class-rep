import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"

import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { TooltipProvider } from "@/components/ui/tooltip"
import { Toaster } from "@/components/ui/sonner"
import { I18nProvider } from "@/lib/i18n/context"
import { StudySDKProvider } from "@/components/study-sdk-provider"
import { MFAModal } from "@/components/mfa-modal"
import { BackgroundImage } from "@/components/background-image"
import { BackButtonHandler } from "@/components/back-button-handler"
import { DeepLinkHandler } from "@/components/deep-link-handler"
import { ProviderProvider } from "@/providers/provider-context"
import { cn } from "@/lib/utils"
import { APP_CONFIG } from "@/lib/app-config"

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-sans",
  preload: false,
})

const fontMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  preload: false,
})

export const metadata: Metadata = {
  title: {
    default: APP_CONFIG.appName,
    template: `%s · ${APP_CONFIG.appName}`,
  },
  description: "面向燕山大学学生的非官方教务查询客户端。",
  applicationName: APP_CONFIG.appName,
  authors: [{ name: "ysu-client contributors" }],
  keywords: [APP_CONFIG.appName, APP_CONFIG.englishName, "燕山大学", "YSU", "教务系统"],
  appleWebApp: {
    capable: true,
    title: APP_CONFIG.appName,
    statusBarStyle: "default",
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="zh-CN"
      suppressHydrationWarning
      className={cn("antialiased", fontMono.variable, "font-sans", geist.variable)}
    >
      <body>
        <I18nProvider>
          <ThemeProvider>
            <ProviderProvider>
              <StudySDKProvider>
                <TooltipProvider>
                  <BackgroundImage />
                  <BackButtonHandler />
                  <DeepLinkHandler />
                  {children}
                  <Toaster />
                  <MFAModal />
                </TooltipProvider>
              </StudySDKProvider>
            </ProviderProvider>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  )
}
