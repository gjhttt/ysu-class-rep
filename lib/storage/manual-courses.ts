import type { Course } from "@/providers/types"
import { APP_CONFIG } from "@/lib/app-config"

const PREFIX = `${APP_CONFIG.storagePrefix}-manual-courses:`

function storageKey(username: string, semester: string): string {
  return `${PREFIX}${encodeURIComponent(username)}:${encodeURIComponent(semester)}`
}

function canUseStorage(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined"
}

export function isManualCourse(course: Course): boolean {
  return course.raw?.__manual === true
}

export function loadManualCourses(username: string, semester: string): Course[] {
  if (!canUseStorage()) return []
  try {
    const value = JSON.parse(localStorage.getItem(storageKey(username, semester)) ?? "[]")
    return Array.isArray(value) ? value : []
  } catch {
    return []
  }
}

export function saveManualCourses(username: string, semester: string, courses: Course[]): void {
  if (!canUseStorage()) return
  try {
    localStorage.setItem(storageKey(username, semester), JSON.stringify(courses))
  } catch {
    // Ignore a full or unavailable local storage; the schedule remains usable this session.
  }
}

export function clearManualCourses(): void {
  if (!canUseStorage()) return
  const keys: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i)
    if (key?.startsWith(PREFIX)) keys.push(key)
  }
  keys.forEach((key) => localStorage.removeItem(key))
}
