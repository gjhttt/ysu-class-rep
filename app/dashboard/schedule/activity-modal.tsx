"use client"

import { Badge } from "@/components/ui/badge"
import {
  ResponsiveModal,
  ResponsiveModalBody,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/components/responsive-modal"
import { useTranslation } from "@/lib/i18n/use-translation"
import type { Course } from "@/providers/types"

interface Props {
  course: Course | null
  week: number
  open: boolean
  onOpenChange: (open: boolean) => void
  onSigninActivity?: (activityId: string, signinType: number) => void
}

export function ActivityModal({ course, open, onOpenChange }: Props) {
  const { t } = useTranslation()
  const details = [
    [t("schedule.teacher"), course?.teacher],
    [t("schedule.classroom"), course?.classroom],
    [t("schedule.weeks"), course?.weeks],
    [t("schedule.credit"), course?.credit],
  ]

  return (
    <ResponsiveModal open={open} onOpenChange={onOpenChange}>
      <ResponsiveModalContent className="sm:max-w-md">
        <ResponsiveModalHeader>
          <ResponsiveModalTitle>{course?.name || t("schedule.courseDetail")}</ResponsiveModalTitle>
          {course && (
            <div className="flex flex-wrap items-center justify-center gap-1 pt-1">
              {course.courseType && (
                <Badge variant="secondary" className="h-5 px-1.5 text-[10px]">
                  {course.courseType}
                </Badge>
              )}
              {course.code && (
                <Badge variant="outline" className="h-5 px-1.5 font-mono text-[10px]">
                  {course.code}
                </Badge>
              )}
            </div>
          )}
        </ResponsiveModalHeader>
        <ResponsiveModalBody>
          <dl className="grid grid-cols-2 gap-3">
            {details.map(([label, value]) => (
              <div key={label} className="min-h-20 rounded-xl border bg-muted/30 p-3">
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="mt-2 text-sm leading-relaxed font-medium">{value || "-"}</dd>
              </div>
            ))}
          </dl>
        </ResponsiveModalBody>
      </ResponsiveModalContent>
    </ResponsiveModal>
  )
}
