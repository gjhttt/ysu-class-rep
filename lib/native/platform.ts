/** 检测当前是否在 Capacitor 原生环境中运行。 */

import { Capacitor } from "@capacitor/core"

export function isCapacitor(): boolean {
  return typeof window !== "undefined" && Capacitor.isNativePlatform()
}

/** Tablets have a shorter screen edge >= 600 CSS pixels (covers budget tablets). */
export function isTablet(): boolean {
  if (typeof window === "undefined") return false
  const shortEdge = Math.min(window.screen.width, window.screen.height)
  return shortEdge >= 600
}
