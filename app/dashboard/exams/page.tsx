"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty"
import { FilterDrawer, FilterTrigger } from "@/components/academic/filter-drawer"
import { ResponsiveSelect } from "@/components/responsive-select"
import { useSettingsStore } from "@/lib/stores/settings"
import { useMobileHeaderRight } from "@/lib/stores/mobile-header"
import { useTranslation } from "@/lib/i18n/use-translation"
import {
  compareExamStartTime,
  formatExamTime,
  getExamMessageKey,
  isExamCompleted,
  recentSemesterCodes,
} from "@/lib/academic/exam-utils"
import { syncExamsToWidget } from "@/lib/native/widget-bridge"
import { useCurrentWeek, useExams } from "@/providers/hooks"
import { CalendarOff, CheckCircle2, Clock, MapPin, Search, Sparkles } from "lucide-react"

const CURRENT_TERM = "__current__"

export default function ExamsPage() {
  const { t } = useTranslation()
  const [term, setTerm] = useState(CURRENT_TERM)
  const [queriedTerm, setQueriedTerm] = useState(CURRENT_TERM)
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false)
  const widgetSyncReminderHours = useSettingsStore((s) => s.widgetSyncReminderHours)
  const currentWeek = useCurrentWeek()
  const currentSemester = currentWeek.data?.semester
  const selectedSemester = queriedTerm === CURRENT_TERM ? undefined : queriedTerm
  const examsQuery = useExams({ semester: selectedSemester })
  const exams = examsQuery.data ?? []
  const loading = examsQuery.isLoading || examsQuery.isValidating
  const termItems = useMemo(
    () => [
      {
        value: CURRENT_TERM,
        label: currentSemester
          ? t("exams.currentTermWithCode", { term: currentSemester })
          : t("exams.currentTerm"),
      },
      ...recentSemesterCodes(currentSemester)
        .slice(1)
        .map((value) => ({ value, label: value })),
    ],
    [currentSemester, t]
  )
  const activeTermLabel = termItems.find((item) => item.value === queriedTerm)?.label ?? queriedTerm

  useEffect(() => {
    if (queriedTerm !== CURRENT_TERM || !examsQuery.data) return
    syncExamsToWidget(examsQuery.data, widgetSyncReminderHours).catch(() => {})
  }, [queriedTerm, examsQuery.data, widgetSyncReminderHours])

  useEffect(() => {
    if (!examsQuery.error) return
    toast.error(examsQuery.error.message || t("app.updating"))
  }, [examsQuery.error, t])

  async function handleQuery() {
    const nextTerm = term.trim()
    setFilterDrawerOpen(false)
    if (nextTerm === queriedTerm) {
      await examsQuery.mutate()
      return
    }
    setQueriedTerm(nextTerm)
  }

  useMobileHeaderRight(
    <FilterTrigger label={activeTermLabel} onClick={() => setFilterDrawerOpen(true)} />,
    [activeTermLabel]
  )

  const renderFilterControls = (idPrefix: string) => (
    <FieldGroup className="flex flex-row flex-wrap items-end gap-3">
      <Field className="w-48">
        <FieldLabel htmlFor={`${idPrefix}-term`}>{t("exams.termLabel")}</FieldLabel>
        <ResponsiveSelect
          id={`${idPrefix}-term`}
          value={term}
          onValueChange={setTerm}
          items={termItems}
          placeholder={t("exams.currentTerm")}
          title={t("exams.termLabel")}
          nested
        />
      </Field>
      <Button onClick={handleQuery} disabled={loading}>
        {loading ? <Spinner data-icon="inline-start" /> : <Search data-icon="inline-start" />}
        {t("exams.query")}
      </Button>
    </FieldGroup>
  )

  const upcomingExams = exams.filter((e) => !isExamCompleted(e)).sort(compareExamStartTime)
  const completedExams = exams
    .filter((e) => isExamCompleted(e))
    .sort((a, b) => compareExamStartTime(b, a))
  const examMessage = t(getExamMessageKey(upcomingExams), { count: upcomingExams.length })

  if (loading && exams.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-12" />
        <div className="grid gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="hidden md:block">
        <CardHeader>
          <CardTitle>{t("exams.title")}</CardTitle>
          <CardDescription>{t("exams.description")}</CardDescription>
        </CardHeader>
        <CardContent>{renderFilterControls("exams-desktop")}</CardContent>
      </Card>

      <FilterDrawer
        open={filterDrawerOpen}
        onOpenChange={setFilterDrawerOpen}
        title={t("exams.title")}
        description={t("exams.description")}
      >
        {renderFilterControls("exams-drawer")}
      </FilterDrawer>

      {!examsQuery.error && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-start gap-3 py-4">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sparkles className="size-4" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium">{t("exams.messageTitle")}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{examMessage}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {exams.length === 0 ? (
        <Empty className="rounded-xl border bg-card py-12">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <CalendarOff />
            </EmptyMedia>
            <EmptyTitle>
              {examsQuery.error
                ? t("exams.queryFailed")
                : t("exams.noDataForTerm", { term: activeTermLabel })}
            </EmptyTitle>
            <EmptyDescription>
              {examsQuery.error ? examsQuery.error.message : t("exams.noDataHint")}
            </EmptyDescription>
          </EmptyHeader>
          {examsQuery.error && (
            <EmptyContent>
              <Button variant="outline" onClick={() => examsQuery.mutate()} disabled={loading}>
                {loading && <Spinner data-icon="inline-start" />}
                {t("exams.retry")}
              </Button>
            </EmptyContent>
          )}
        </Empty>
      ) : (
        <div className="flex flex-col gap-6">
          {upcomingExams.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-medium text-muted-foreground">
                {t("exams.upcomingExams")} · {t("exams.examCount", { count: upcomingExams.length })}
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {upcomingExams.map((exam) => (
                  <Card key={`${exam.name}-${exam.startAt ?? ""}-${exam.examLocation ?? ""}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">{exam.name}</CardTitle>
                        <Badge variant="default">{t("exams.upcomingExams")}</Badge>
                      </div>
                      <CardDescription>{exam.examName}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="size-4 text-muted-foreground" />
                        <span>{formatExamTime(exam)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="size-4 text-muted-foreground" />
                        <span>{exam.examLocation}</span>
                      </div>
                      {exam.seatNumber && (
                        <Badge variant="outline">
                          {t("exams.seatNumber")}: {exam.seatNumber}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {completedExams.length > 0 && (
            <section className="flex flex-col gap-3">
              <h2 className="text-sm font-medium text-muted-foreground">
                {t("exams.completedExams")} ·{" "}
                {t("exams.examCount", { count: completedExams.length })}
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {completedExams.map((exam) => (
                  <Card
                    key={`${exam.name}-${exam.startAt ?? ""}-${exam.examLocation ?? ""}`}
                    className="opacity-60"
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">{exam.name}</CardTitle>
                        <Badge variant="secondary" className="gap-1">
                          <CheckCircle2 className="size-3" />
                          {t("exams.completed")}
                        </Badge>
                      </div>
                      <CardDescription>{exam.examName}</CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock className="size-4 text-muted-foreground" />
                        <span>{formatExamTime(exam)}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="size-4 text-muted-foreground" />
                        <span>{exam.examLocation}</span>
                      </div>
                      {exam.seatNumber && (
                        <Badge variant="outline">
                          {t("exams.seatNumber")}: {exam.seatNumber}
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
