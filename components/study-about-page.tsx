"use client"

import { useState } from "react"
import { BadgeInfo, Code2, ExternalLink, RefreshCw, ShieldCheck, Store } from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { APP_CONFIG } from "@/lib/app-config"
import { APP_BUILD, APP_VERSION } from "@/lib/version"
import { checkForUpdate } from "@/lib/updater"
import { useUpdateStore } from "@/lib/stores/update"

export function StudyAboutPage() {
  const [checking, setChecking] = useState(false)

  async function handleCheckUpdate() {
    setChecking(true)
    try {
      const update = await checkForUpdate(false)
      if (!update.available) {
        toast.success("当前已是最新版本")
        return
      }
      useUpdateStore.getState().setUpdateInfo(update)
      useUpdateStore.getState().setUpdateStatus(true)
      useUpdateStore.getState().setShowDialog(true)
    } catch {
      toast.error("检查更新失败，请稍后重试")
    } finally {
      setChecking(false)
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <Card>
        <CardHeader>
          <CardTitle>{APP_CONFIG.appName}</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
          <p>{APP_CONFIG.englishName}</p>
          <p>
            版本 {APP_VERSION} · 构建 {APP_BUILD}
          </p>
          <Button variant="outline" className="mt-2 w-full" onClick={handleCheckUpdate} disabled={checking}>
            <RefreshCw className={checking ? "size-4 animate-spin" : "size-4"} />
            {checking ? "正在检查…" : "检查更新"}
          </Button>
          <p>面向燕山大学学生的非官方第三方客户端，与燕山大学官方无隶属关系。</p>
          <p>
            主要用于查看本人学籍、成绩、课表和考试等教务信息；仅学生评教支持本人逐题填写、预检并确认提交，不提供自动作答、批量评教、选课、报名或签到功能。
          </p>
        </CardContent>
      </Card>

      <Card className="border-primary/30 bg-primary/5">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="size-5 text-primary" /> 仅限个人使用
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
          <p>
            当前安装包是私人测试构建，仅供本人在受信任设备上使用。未经开发者确认，请勿转发安装包、公开上传、售卖、二次打包或冒充官方发布。
          </p>
          <p>
            本说明不限制 GPL-3.0 依法授予的权利；任何依据 GPL-3.0
            进行的再分发，都必须保留许可证与版权声明、提供对应完整源码，并自行承担账号安全、版本维护和非官方软件说明责任。
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ShieldCheck className="size-5 text-primary" /> 隐私说明
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
          <p>
            正式 Android
            版由手机直接访问燕山大学统一身份认证与教务系统，不经过自建中转服务器，也不接入统计或广告平台。
          </p>
          <p>
            开发者不会收集你的学号、密码、Cookie、成绩、排名、课表或考试信息。请只在自己信任的设备上登录，并妥善保管锁屏密码。
          </p>
          <p>在线公告和版本检查只读取当前项目 GitHub 上的公开文件，不携带账号、Cookie 或教务数据。</p>
          <p>
            必要会话存入 Android
            系统安全存储；展示缓存可在设置中清除，退出登录会一并清除该账号的凭据和缓存。
          </p>
          <p>Mock 数据均为脱敏示例，不代表任何真实学生或真实查询结果。</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BadgeInfo className="size-5 text-primary" /> 使用说明
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
          <p>
            本项目免费提供。为避免旧版、篡改版或钓鱼版传播，私人测试安装包仅限个人使用，请不要在未经开发者确认的情况下转发或上传网络。
          </p>
          <p>
            每位使用者都应使用自己的燕大账号登录，不要向他人发送账号、密码、验证码、缓存文件或应用备份。验证码和多因素认证必须由账号本人完成。
          </p>
          <p>
            本应用只负责展示学校系统实际返回的数据。涉及成绩、学籍和考试安排的最终解释，请以燕山大学官方教务系统及学校通知为准。
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <Store className="size-5 text-primary" /> 免费获取与防倒卖
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm leading-relaxed text-muted-foreground">
          <p>
            请勿购买来源不明的安装包，也不要使用要求提交燕大学号、密码或验证码的所谓“代查”“授权”服务。
          </p>
          <p>
            任何付费转售、二次打包或宣传均不代表作者授权、燕山大学认可或官方服务。请警惕冒充官方、删除署名、隐藏源码来源和诱导提交凭据的版本。
          </p>
          <p>
            GPL-3.0
            允许在遵守许可证的前提下再分发（包括收费分发）；再分发者必须同时履行提供对应源码、保留许可证与版权声明等义务。
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">开源与署名</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm text-muted-foreground">
          <p>
            感谢 Youwenqwq 及 ysu-client、ysu-sdk 的作者与贡献者所做的探索和开源工作。本项目在前人已验证的认证流程、教务接口与客户端实现基础上进行学习、适配和改进。
          </p>
          <p>
            本项目按 GPL-3.0
            发布，并保留原项目作者与贡献者的许可证和版权信息。修改或再发布时，不得删除这些信息，并应向接收者提供与所分发版本对应的完整源码及同等许可证权利。
          </p>
          <p>当前版本仅用于开发者个人学习与日常教务查询，不代表燕山大学官方应用，也不作为公共服务或商业产品运营。</p>
          <a
            href={APP_CONFIG.upstreamUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-primary underline underline-offset-2"
          >
            <Code2 className="size-4" /> 原项目 Youwenqwq/ysu-client
            <ExternalLink className="size-3" />
          </a>
          {APP_CONFIG.repositoryUrl ? (
            <a
              href={APP_CONFIG.repositoryUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-primary underline underline-offset-2"
            >
              <Code2 className="size-4" /> 当前项目 GitHub
              <ExternalLink className="size-3" />
            </a>
          ) : (
            <p>当前项目 GitHub 地址尚未配置；发布前请填写 app.config.json。</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
