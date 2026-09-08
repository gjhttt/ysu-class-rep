"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Calendar, FileText, GraduationCap, LayoutDashboard, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { useTranslation } from "@/lib/i18n/use-translation"

export function MobileBottomNav() {
  const pathname = usePathname()
  const { t } = useTranslation()

  const tabs = [
    { href: "/dashboard", label: t("app.overview"), icon: LayoutDashboard },
    { href: "/dashboard/schedule", label: t("app.schedule"), icon: Calendar },
    { href: "/dashboard/grades", label: t("app.grades"), icon: GraduationCap },
    { href: "/dashboard/exams", label: t("app.exams"), icon: FileText },
    { href: "/dashboard/me", label: t("app.me"), icon: User },
  ]

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-5 border-t border-border/80 bg-background/95 pb-[var(--safe-area-inset-bottom,env(safe-area-inset-bottom,0px))] shadow-[0_-4px_18px_-16px_oklch(0.2_0.03_250)] backdrop-blur-md md:hidden"
      aria-label="Primary"
    >
      {tabs.map((tab) => {
        const isActive =
          tab.href === "/dashboard"
            ? pathname === "/dashboard"
            : pathname === tab.href || pathname.startsWith(`${tab.href}/`)
        const Icon = tab.icon
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={cn(
              "flex min-h-14 flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
              isActive
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
            aria-current={isActive ? "page" : undefined}
          >
            <span className={cn("flex size-8 items-center justify-center rounded-xl transition-colors", isActive && "bg-primary/10")}>
              <Icon className="size-5" />
            </span>
            <span>{tab.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
