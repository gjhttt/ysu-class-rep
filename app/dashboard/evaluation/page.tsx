"use client"

import { useEffect, useMemo, useState } from "react"
import { toast } from "sonner"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty"
import {
  ResponsiveModal,
  ResponsiveModalBody,
  ResponsiveModalContent,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalHeader,
  ResponsiveModalTitle,
} from "@/components/responsive-modal"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useTranslation } from "@/lib/i18n/use-translation"
import { useMobileHeaderRight } from "@/lib/stores/mobile-header"
import { useEvaluationTypes, usePendingEvaluations } from "@/providers/hooks"
import { useProvider } from "@/providers/use-provider"
import type {
  EvaluationAnswer,
  EvaluationDetail,
  EvaluationScoreInput,
  EvaluationTask,
  Question,
} from "@/providers/types"
import { ChevronDown, ClipboardCheck, ShieldCheck } from "lucide-react"

function parseTaskTimestamp(value: string | undefined): number | undefined {
  if (!value) return undefined
  const timestamp = new Date(value.replace(" ", "T")).getTime()
  return Number.isFinite(timestamp) ? timestamp : undefined
}

function taskStatus(task: EvaluationTask): "active" | "not_started" | "ended" {
  const now = Date.now()
  const start = task.startTimestamp ?? parseTaskTimestamp(task.startAt ?? task.startTime)
  const end = task.endTimestamp ?? parseTaskTimestamp(task.endAt ?? task.endTime)
  if (start !== undefined && now < start) return "not_started"
  if (end !== undefined && now > end) return "ended"
  if (task.status === "not_started" || task.status === "ended") return task.status
  return "active"
}

function teacherRelationId(task: EvaluationTask, detail: EvaluationDetail): string {
  return (
    ((detail.teachers?.[0] as Record<string, unknown> | undefined)?.PJGXID as string | undefined) ||
    task.teacherId ||
    ""
  )
}

function answerText(question: Question, answer: EvaluationAnswer | undefined): string {
  if (!answer) return "-"
  if (question.questionType === "01" || question.questionType === "07") {
    const selected = question.options.filter((option) => answer.optionIds?.includes(option.wid))
    return (
      selected
        .map((option) => option.text)
        .filter(Boolean)
        .join("、") || "-"
    )
  }
  return answer.text?.trim() || "-"
}

export default function EvaluationPage() {
  const provider = useProvider()
  const { t } = useTranslation()
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedTask, setSelectedTask] = useState<EvaluationTask | null>(null)
  const [detail, setDetail] = useState<EvaluationDetail | null>(null)
  const [answers, setAnswers] = useState<Record<string, EvaluationAnswer>>({})
  const [dialogOpen, setDialogOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [loadingDetail, setLoadingDetail] = useState(false)
  const [checking, setChecking] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const typesQuery = useEvaluationTypes()
  const tasksQuery = usePendingEvaluations(selectedType ?? undefined)
  const types = useMemo(() => typesQuery.data ?? [], [typesQuery.data])
  const tasks = useMemo(() => tasksQuery.data ?? [], [tasksQuery.data])
  const selectedTypeName = types.find((type) => type.code === selectedType)?.name

  useEffect(() => {
    const error = typesQuery.error ?? tasksQuery.error
    if (error) toast.error(error.message || t("app.updating"))
  }, [typesQuery.error, tasksQuery.error, t])

  useEffect(() => {
    if (!selectedType && types[0]?.code) setSelectedType(types[0].code)
  }, [selectedType, types])

  useMobileHeaderRight(
    types.length > 0 ? (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 px-2 text-sm">
            <span className="max-w-28 truncate">{selectedTypeName || t("evaluation.title")}</span>
            <ChevronDown className="ml-1 size-3.5" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {types.map((type) => (
            <DropdownMenuItem key={type.code} onSelect={() => setSelectedType(type.code || null)}>
              <span className="flex-1">{type.name}</span>
              {type.count > 0 && <Badge variant="secondary">{type.count}</Badge>}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    ) : null,
    [types, selectedTypeName, t]
  )

  async function openTask(task: EvaluationTask) {
    const status = taskStatus(task)
    if (status !== "active") {
      toast.error(t(`evaluation.status${status === "ended" ? "Ended" : "NotStarted"}`))
      return
    }

    setSelectedTask(task)
    setDetail(null)
    setAnswers({})
    setDialogOpen(true)
    setLoadingDetail(true)
    try {
      const nextDetail = await provider.getEvaluationDetail({
        groupNo: task.groupNo || "",
        evalType: task.evalType || "",
        sequence: task.sequence,
      })
      setDetail(nextDetail)
      setAnswers(
        Object.fromEntries(
          nextDetail.questions.map((question) => [
            question.tmid,
            {
              tmid: question.tmid,
              questionType: question.questionType || "",
              optionIds: [],
              text: "",
            },
          ])
        )
      )
    } catch (error) {
      toast.error((error as Error).message || t("app.updating"))
      setDialogOpen(false)
    } finally {
      setLoadingDetail(false)
    }
  }

  function setAnswer(question: Question, answer: EvaluationAnswer) {
    setAnswers((current) => ({ ...current, [question.tmid]: answer }))
  }

  function validationError(): string | null {
    if (!detail) return t("evaluation.validation.notLoaded")
    for (const question of detail.questions) {
      const answer = answers[question.tmid]
      if (!answer) return t("evaluation.validation.unanswered", { order: question.order })
      if (
        (question.questionType === "01" || question.questionType === "07") &&
        !answer.optionIds?.length
      ) {
        return t("evaluation.validation.unanswered", { order: question.order })
      }
      if (
        question.questionType !== "01" &&
        question.questionType !== "07" &&
        !answer.text?.trim()
      ) {
        return t("evaluation.validation.unanswered", { order: question.order })
      }
    }
    return null
  }

  function evaluationInput(): EvaluationScoreInput | null {
    if (!selectedTask || !detail) return null
    return {
      groupNo: selectedTask.groupNo || "",
      wjid: selectedTask.wjid || detail.wjid || "",
      evalType: selectedTask.evalType || "",
      answers: Object.values(answers),
      teacherRelationId: teacherRelationId(selectedTask, detail),
      courseName: selectedTask.courseName || "",
      teacherName: selectedTask.teacherName || "",
      sequence: Number(selectedTask.sequence),
    }
  }

  async function preview() {
    const error = validationError()
    if (error) return toast.error(error)
    const input = evaluationInput()
    if (!input) return

    setChecking(true)
    try {
      await provider.calculateEvaluationScore(input)
      setConfirmOpen(true)
    } catch (previewError) {
      toast.error((previewError as Error).message || t("evaluation.previewFailed"))
    } finally {
      setChecking(false)
    }
  }

  async function submit() {
    const input = evaluationInput()
    if (!input) return

    setSubmitting(true)
    try {
      await provider.submitEvaluation(input)
      toast.success(t("evaluation.submitSuccess"))
      setConfirmOpen(false)
      setDialogOpen(false)
      await Promise.all([typesQuery.mutate(), tasksQuery.mutate()])
    } catch (submitError) {
      toast.error((submitError as Error).message || t("evaluation.submitFailed"))
    } finally {
      setSubmitting(false)
    }
  }

  if (typesQuery.isLoading && types.length === 0) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-24" />
        <Skeleton className="h-48" />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <CardTitle>{t("evaluation.title")}</CardTitle>
          <CardDescription>{t("evaluation.manualDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          {types.map((type) => (
            <Button
              key={type.code}
              variant={selectedType === type.code ? "default" : "outline"}
              onClick={() => setSelectedType(type.code || null)}
            >
              {type.name}
              {type.count > 0 && <Badge variant="secondary">{type.count}</Badge>}
            </Button>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t("evaluation.pendingTasks")}</CardTitle>
          <CardDescription>{selectedTypeName}</CardDescription>
        </CardHeader>
        <CardContent>
          {tasksQuery.isLoading && tasks.length === 0 ? (
            <Skeleton className="h-40" />
          ) : tasks.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <ClipboardCheck />
                </EmptyMedia>
                <EmptyTitle>{t("evaluation.noTasks")}</EmptyTitle>
              </EmptyHeader>
            </Empty>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {tasks.map((task) => {
                const status = taskStatus(task)
                const active = status === "active"
                return (
                  <Card
                    key={task.wid || `${task.courseName}-${task.teacherName}`}
                    className={
                      active ? "cursor-pointer transition-colors hover:bg-muted/40" : "opacity-60"
                    }
                    onClick={() => openTask(task)}
                  >
                    <CardHeader className="pb-2">
                      <CardTitle className="truncate text-base">{task.courseName}</CardTitle>
                      <CardDescription className="truncate">{task.teacherName}</CardDescription>
                      <CardAction>
                        <Badge variant={active ? "default" : "secondary"}>
                          {t(
                            status === "active"
                              ? "evaluation.statusActive"
                              : status === "ended"
                                ? "evaluation.statusEnded"
                                : "evaluation.statusNotStarted"
                          )}
                        </Badge>
                      </CardAction>
                    </CardHeader>
                    <CardContent className="text-xs text-muted-foreground">
                      {[task.termName, task.className].filter(Boolean).join(" · ")}
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <ResponsiveModal open={dialogOpen} onOpenChange={setDialogOpen}>
        <ResponsiveModalContent className="max-h-[92vh] overflow-auto sm:max-w-2xl">
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>{detail?.name || t("evaluation.title")}</ResponsiveModalTitle>
            <ResponsiveModalDescription>
              {[selectedTask?.courseName, selectedTask?.teacherName].filter(Boolean).join(" · ")}
            </ResponsiveModalDescription>
          </ResponsiveModalHeader>
          <ResponsiveModalBody>
            {loadingDetail ? (
              <div className="flex flex-col gap-4">
                <Skeleton className="h-24" />
                <Skeleton className="h-24" />
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                {detail?.questions.map((question) => (
                  <div key={question.tmid} className="flex flex-col gap-3">
                    <p className="font-medium">
                      {question.order}. {question.text}
                    </p>
                    {question.questionType === "01" && (
                      <RadioGroup
                        value={answers[question.tmid]?.optionIds?.[0] || ""}
                        onValueChange={(value) =>
                          setAnswer(question, {
                            tmid: question.tmid,
                            questionType: question.questionType || "",
                            optionIds: [value],
                            text: "",
                          })
                        }
                      >
                        {question.options.map((option) => (
                          <div key={option.wid} className="flex items-center gap-2">
                            <RadioGroupItem
                              value={option.wid}
                              id={`${question.tmid}-${option.wid}`}
                            />
                            <Label htmlFor={`${question.tmid}-${option.wid}`}>{option.text}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    )}
                    {question.questionType === "07" &&
                      question.options.map((option) => {
                        const selected =
                          answers[question.tmid]?.optionIds?.includes(option.wid) || false
                        return (
                          <div key={option.wid} className="flex items-center gap-2">
                            <Checkbox
                              id={`${question.tmid}-${option.wid}`}
                              checked={selected}
                              onCheckedChange={(checked) => {
                                const current = answers[question.tmid]?.optionIds || []
                                setAnswer(question, {
                                  tmid: question.tmid,
                                  questionType: question.questionType || "",
                                  optionIds: checked
                                    ? [...current, option.wid]
                                    : current.filter((id) => id !== option.wid),
                                  text: "",
                                })
                              }}
                            />
                            <Label htmlFor={`${question.tmid}-${option.wid}`}>{option.text}</Label>
                          </div>
                        )
                      })}
                    {question.questionType !== "01" && question.questionType !== "07" && (
                      <Textarea
                        value={answers[question.tmid]?.text || ""}
                        placeholder={t("evaluation.textPlaceholder")}
                        onChange={(event) =>
                          setAnswer(question, {
                            tmid: question.tmid,
                            questionType: question.questionType || "",
                            optionIds: [],
                            text: event.target.value,
                          })
                        }
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </ResponsiveModalBody>
          <ResponsiveModalFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {t("evaluation.cancel")}
            </Button>
            <Button onClick={preview} disabled={loadingDetail || checking}>
              {checking && <Spinner data-icon="inline-start" />}
              {checking ? t("evaluation.previewing") : t("evaluation.preview")}
            </Button>
          </ResponsiveModalFooter>
        </ResponsiveModalContent>
      </ResponsiveModal>

      <ResponsiveModal open={confirmOpen} onOpenChange={setConfirmOpen}>
        <ResponsiveModalContent className="max-h-[90vh] overflow-auto sm:max-w-xl">
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>{t("evaluation.confirmTitle")}</ResponsiveModalTitle>
            <ResponsiveModalDescription>
              {t("evaluation.confirmDescription")}
            </ResponsiveModalDescription>
          </ResponsiveModalHeader>
          <ResponsiveModalBody className="flex flex-col gap-3">
            <div className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
              <ShieldCheck className="mt-0.5 size-4 shrink-0 text-primary" />
              <span>{t("evaluation.previewPassed")}</span>
            </div>
            {detail?.questions.map((question) => (
              <div key={question.tmid} className="rounded-lg border p-3 text-sm">
                <p className="text-muted-foreground">
                  {question.order}. {question.text}
                </p>
                <p className="mt-1 font-medium">{answerText(question, answers[question.tmid])}</p>
              </div>
            ))}
          </ResponsiveModalBody>
          <ResponsiveModalFooter>
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>
              {t("evaluation.backToEdit")}
            </Button>
            <Button onClick={submit} disabled={submitting}>
              {submitting && <Spinner data-icon="inline-start" />}
              {submitting ? t("evaluation.submitting") : t("evaluation.confirmSubmit")}
            </Button>
          </ResponsiveModalFooter>
        </ResponsiveModalContent>
      </ResponsiveModal>
    </div>
  )
}
