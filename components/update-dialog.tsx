"use client"

import { useCallback, useMemo, useState } from "react"
import Markdown from "react-markdown"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { useUpdateStore } from "@/lib/stores/update"
import { downloadApkInApp, installDownloadedApk } from "@/lib/updater"

type DialogState = "idle" | "downloading" | "downloaded" | "installing" | "error"

export function UpdateDialog() {
  const updateInfo = useUpdateStore((state) => state.updateInfo)
  const showDialog = useUpdateStore((state) => state.showDialog)
  const setShowDialog = useUpdateStore((state) => state.setShowDialog)
  const [state, setState] = useState<DialogState>("idle")
  const [progress, setProgress] = useState(0)
  const [permissionHint, setPermissionHint] = useState(false)

  const close = useCallback(() => {
    setShowDialog(false)
    setState("idle")
    setProgress(0)
    setPermissionHint(false)
  }, [setShowDialog])

  const download = useCallback(async () => {
    if (!updateInfo) return
    setState("downloading")
    setProgress(0)
    try {
      await downloadApkInApp(updateInfo, setProgress)
      setState("downloaded")
    } catch {
      setState("error")
    }
  }, [updateInfo])

  const install = useCallback(async () => {
    setState("installing")
    try {
      const result = await installDownloadedApk()
      if (result === "permission-required") {
        setPermissionHint(true)
        setState("downloaded")
      } else {
        close()
      }
    } catch {
      setState("error")
    }
  }, [close])

  const markdown = useMemo(
    () => ({
      p: ({ children }: { children?: React.ReactNode }) => (
        <p className="text-sm leading-relaxed text-muted-foreground">{children}</p>
      ),
      li: ({ children }: { children?: React.ReactNode }) => <li className="text-sm">{children}</li>,
    }),
    []
  )

  if (!updateInfo?.available) return null

  return (
    <Dialog
      open={showDialog}
      onOpenChange={(open) => !open && !["downloading", "installing"].includes(state) && close()}
    >
      <DialogContent showCloseButton={state === "idle" || state === "error"}>
        <DialogHeader>
          <DialogTitle>发现新版本 {updateInfo.version}</DialogTitle>
          <DialogDescription>安装前会由 Android 系统再次要求确认。</DialogDescription>
        </DialogHeader>
        {state === "downloading" ? (
          <div className="space-y-2 py-3">
            <p className="text-sm text-muted-foreground">正在下载… {progress}%</p>
            <Progress value={progress} />
          </div>
        ) : state === "error" ? (
          <p className="py-3 text-sm text-destructive">下载或安装启动失败，请检查网络后重试。</p>
        ) : (
          <div className="max-h-72 space-y-2 overflow-y-auto py-3">
            {updateInfo.body ? (
              <Markdown components={markdown}>{updateInfo.body}</Markdown>
            ) : (
              <p className="text-sm text-muted-foreground">本次发布没有填写更新说明。</p>
            )}
          </div>
        )}
        {permissionHint && (
          <p className="rounded-lg bg-muted p-3 text-sm">
            请在刚打开的系统页面允许“安装未知应用”，返回后再次点击安装。
          </p>
        )}
        <DialogFooter>
          <Button
            variant="outline"
            onClick={close}
            disabled={state === "downloading" || state === "installing"}
          >
            稍后再说
          </Button>
          <Button
            onClick={state === "downloaded" ? install : download}
            disabled={state === "downloading" || state === "installing"}
          >
            {state === "downloaded"
              ? permissionHint
                ? "授权后重试安装"
                : "打开系统安装器"
              : state === "installing"
                ? "正在打开…"
                : "下载更新"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
