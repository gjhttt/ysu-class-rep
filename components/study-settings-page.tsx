"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useTheme } from "next-themes"
import { toast } from "sonner"
import { Info, LogOut, Moon, ShieldCheck, Sun, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { clearAllCache } from "@/lib/storage/cache"
import { logoutActiveProvider } from "@/providers/provider-service"
import { clearManualCourses } from "@/lib/storage/manual-courses"
import { clearGpaPredictorData } from "@/lib/storage/gpa-predictor"

export function StudySettingsPage() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  async function handleLogout() {
    await logoutActiveProvider()
    toast.success("已退出登录并清除本地凭据与缓存")
    router.replace("/login")
  }

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">外观</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-2">
          <Button
            variant={theme === "light" ? "default" : "outline"}
            onClick={() => setTheme("light")}
          >
            <Sun className="size-4" /> 浅色
          </Button>
          <Button
            variant={theme === "dark" ? "default" : "outline"}
            onClick={() => setTheme("dark")}
          >
            <Moon className="size-4" /> 深色
          </Button>
          <Button
            variant={theme === "system" ? "default" : "outline"}
            onClick={() => setTheme("system")}
          >
            跟随系统
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">数据与隐私</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="flex gap-3 rounded-lg bg-muted p-3 text-sm leading-relaxed text-muted-foreground">
            <ShieldCheck className="mt-0.5 size-5 shrink-0 text-primary" />
            <p>真实账号只在 Android 端直连学校系统使用；应用不接入统计、广告或第三方分析服务。</p>
          </div>
          <Button
            variant="outline"
            className="justify-start"
            onClick={() => {
              clearAllCache()
              clearManualCourses()
              clearGpaPredictorData()
              toast.success("展示缓存已清除")
            }}
          >
            <Trash2 className="size-4" /> 清除展示缓存
          </Button>
          <Button variant="outline" className="justify-start" asChild>
            <Link href="/dashboard/me/about">
              <Info className="size-4" /> 隐私、许可证与关于
            </Link>
          </Button>
          <Button variant="destructive" className="justify-start" onClick={handleLogout}>
            <LogOut className="size-4" /> 退出登录并清除本地数据
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
