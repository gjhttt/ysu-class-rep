# 燕大课代表项目规则

- 应用身份集中配置在 `app.config.json`，不得在业务代码中另设名称、包名或发布地址。
- 正式版只在 Android 本地运行，直接连接燕山大学 CAS/JWXT；浏览器开发只允许使用脱敏 Mock，不得增加代理或业务后端。
- 第一版只读，唯一例外是用户逐题填写、服务端预检并二次确认的单项教学评教。禁止自动作答、批量评教、选课、报名和签到。
- 凭据使用 Android 安全存储；不得记录或上传学号、密码、Cookie、Ticket、Token 及教务数据。
- 在线公告只读取本项目 GitHub 的公开 JSON；更新只读取本项目 GitHub Releases 并安装同签名 APK。不得接入统计、反馈上传、远程激活或 OTA 网页代码。
- 保留上游 GPL-3.0 许可证、版权声明和来源署名。

## 验证命令

```powershell
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
pnpm exec cap sync android
Set-Location android
.\gradlew.bat assembleDebug
```

核心分层：UI 位于 `app/` 与 `components/`；Provider 接口与缓存位于 `providers/`；燕大 CAS/JWXT 协议位于 `providers/ysu/`；安全存储和缓存位于 `lib/storage/`。页面不得直接散落教务 HTTP 请求。
