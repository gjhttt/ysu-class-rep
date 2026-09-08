import {
  initializeSession as initializeProviderSession,
  resetSession as resetProviderSession,
} from "../session"

export async function initializeSession(): Promise<void> {
  await initializeProviderSession()
}

export async function warmupSession(): Promise<void> {
  // 第一版按需请求，避免启动时并发预热触发教务系统限流。
}

export function resetSession(): void {
  resetProviderSession()
}
