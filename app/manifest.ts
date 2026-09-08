import type { MetadataRoute } from "next"
import { APP_CONFIG } from "@/lib/app-config"

export const dynamic = "force-static"

type LocalizedManifest = MetadataRoute.Manifest & {
  name_localized?: Record<string, string>
  short_name_localized?: Record<string, string>
  description_localized?: Record<string, string>
  shortcuts_localized?: Record<string, NonNullable<MetadataRoute.Manifest["shortcuts"]>>
}

export default function manifest(): LocalizedManifest {
  const basePath = process.env.APP_BASE_PATH || ""

  return {
    id: `${basePath}/`,
    name: APP_CONFIG.appName,
    short_name: APP_CONFIG.shortName,
    description: "面向燕山大学教务系统的第三方客户端",
    lang: "zh-CN",
    dir: "ltr",
    name_localized: {
      en: APP_CONFIG.englishName,
    },
    short_name_localized: {
      en: APP_CONFIG.englishName,
    },
    description_localized: {
      en: "A third-party client for the Yanshan University academic system.",
    },
    shortcuts: [
      {
        name: "课程表",
        short_name: "课表",
        description: "查看课程表",
        url: "dashboard/schedule/",
        icons: [
          {
            src: "icons/icon-192.webp",
            sizes: "192x192",
            type: "image/webp",
          },
        ],
      },
      {
        name: "成绩查询",
        short_name: "成绩",
        description: "查询课程成绩",
        url: "dashboard/grades/",
        icons: [
          {
            src: "icons/icon-192.webp",
            sizes: "192x192",
            type: "image/webp",
          },
        ],
      },
      {
        name: "考试安排",
        short_name: "考试",
        description: "查看考试安排",
        url: "dashboard/exams/",
        icons: [
          {
            src: "icons/icon-192.webp",
            sizes: "192x192",
            type: "image/webp",
          },
        ],
      },
    ],
    shortcuts_localized: {
      en: [
        {
          name: "Class Schedule",
          short_name: "Schedule",
          description: "View your class schedule",
          url: "dashboard/schedule/",
          icons: [
            {
              src: "icons/icon-192.webp",
              sizes: "192x192",
              type: "image/webp",
            },
          ],
        },
        {
          name: "Grades",
          short_name: "Grades",
          description: "View your course grades",
          url: "dashboard/grades/",
          icons: [
            {
              src: "icons/icon-192.webp",
              sizes: "192x192",
              type: "image/webp",
            },
          ],
        },
        {
          name: "Exams",
          short_name: "Exams",
          description: "View your exam schedule",
          url: "dashboard/exams/",
          icons: [
            {
              src: "icons/icon-192.webp",
              sizes: "192x192",
              type: "image/webp",
            },
          ],
        },
      ],
    },
    start_url: ".",
    scope: ".",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ffffff",
    icons: [
      {
        src: "icons/icon-192.webp",
        sizes: "192x192",
        type: "image/webp",
        purpose: "any",
      },
      {
        src: "icons/icon-512.webp",
        sizes: "512x512",
        type: "image/webp",
        purpose: "any",
      },
      {
        src: "icons/icon-192.webp",
        sizes: "192x192",
        type: "image/webp",
        purpose: "maskable",
      },
      {
        src: "icons/icon-512.webp",
        sizes: "512x512",
        type: "image/webp",
        purpose: "maskable",
      },
    ],
  }
}
