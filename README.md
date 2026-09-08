<p align="center">
  <img src="public/icons/icon-192.webp" width="128" height="128" alt="燕大课代表图标" />
</p>

<h1 align="center">燕大课代表 · YSU Class Rep</h1>

<p align="center">
  面向燕山大学学生的轻量、非官方教务查询 Android 客户端
</p>

<p align="center">
  第一阶段开发中；无真实账号时可使用脱敏 Mock 检查界面
</p>

---

> 本项目是第三方客户端，与燕山大学官方无任何隶属、授权或担保关系。请遵守学校规定，勿用于侵犯他人权益。

## 这是什么

`燕大课代表` 基于上游 `ysu-client` 二次开发，沿用已经验证的 Next.js、React、TypeScript、Capacitor 和 YSU Provider 分层。名称、图标、配色和 Android 应用 ID 均独立配置在 [`app.config.json`](app.config.json) 中。

本项目实现了以下功能：

- CAS 登录、图形验证码和 MFA 交互沿用上游实现，不绕过验证。
- 总览显示学生信息、教学周、平均绩点、今日课程、近期考试、缓存时间与手动刷新。
- 成绩支持学期筛选、排序、GPA 汇总、教学班/同课程统计、分布和排名。
- 课表与考试查询沿用 Provider 服务层；移动端采用总览、课表、成绩、考试、我的五栏导航。
- `NEXT_PUBLIC_MOCK_MODE=true` 时只返回明确标识的脱敏 fixture，不请求学校系统。
- 第一版除手动学生评教外保持只读；评教必须逐题填写、服务端预检并二次确认，不提供自动作答或批量提交。补考报名、完成度重算和移动签到仍被禁用。

## 数据来源与安全性

真实教务请求只允许在 Android 端由 Capacitor HTTP 直接连接学校系统。Web 端不会经过第三方代理；请使用 Mock 模式进行浏览器开发。项目未接入统计、广告或第三方分析服务。

认证会话通过 Android 系统安全存储保存；展示缓存只保留必要数据。退出登录会清除当前凭据、记住的密码和展示缓存。源码、日志和 Git 中不得出现真实学号、密码、Cookie、Ticket 或 Token。

## Windows 开发

要求：Node.js、pnpm 11、Android Studio/Android SDK，以及项目 Gradle Wrapper 支持的 JDK。

```powershell
Set-Location E:\YSU-Study
pnpm install --frozen-lockfile
Copy-Item .env.example .env.local
pnpm run dev
```

浏览器打开 `http://localhost:3000`。Mock 登录可输入任意非空内容；fixture 始终显示“脱敏示例”，不得作为真实接口结果。

## 构建 Android Debug APK

真实模式构建前删除本机 `.env.local` 中的 Mock 开关，然后执行：

```powershell
Set-Location E:\YSU-Study
pnpm run typecheck
pnpm run lint
pnpm run test
pnpm run build
pnpm exec cap sync android
Set-Location android
.\gradlew.bat assembleDebug
```

APK 输出到 `E:\YSU-Study\android\app\build\outputs\apk\debug\app-debug.apk`。也可在项目根目录执行 `pnpm exec cap open android` 后由 Android Studio 构建。不要提交 `.env.local`、签名密钥或本机 SDK 路径。

## 相关项目

本项目保留上游 Git 历史、GPL-3.0 许可证和原作者版权信息：

- [Youwenqwq/ysu-client](https://github.com/Youwenqwq/ysu-client) — 原客户端与主要代码来源
- [Youwenqwq/ysu-sdk](https://github.com/Youwenqwq/ysu-sdk) — 接口语义与协议参考

## 协议

本项目及其分发版本继续按 [GPL-3.0](LICENSE) 提供。发布修改版源码或 APK 时，必须保留许可证与版权/来源声明、标注修改，并向接收者提供相应完整源代码及同等 GPL 权利；不要把本项目改成闭源分发。仅在本机私用而不向他人提供副本时，不触发 GPL 的分发义务。
