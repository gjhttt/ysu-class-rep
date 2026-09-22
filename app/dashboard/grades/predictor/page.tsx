"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { ArrowLeft, Plus } from "lucide-react"
import { toast } from "sonner"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { useAuthStore } from "@/lib/stores/auth"
import { useCurrentWeek, useGPAStats, useGrades, useSchedule } from "@/providers/hooks"
import type { Grade } from "@/providers/types"
import { numericGradeValue } from "@/lib/academic/grades"
import { gradeEntityId, mergeCourseProfiles } from "@/lib/academic/course-data"
import {
  minimumLevelForTarget,
  predictionPoint,
  requiredFutureAverage,
  weightedSummary,
  type PredictionDraft,
  type WeightedCourse,
} from "@/lib/academic/gpa-predictor"
import { loadManualCourses } from "@/lib/storage/manual-courses"
import {
  clonePredictionData,
  courseEntityId,
  effectiveCredit,
  emptyPredictorData,
  loadGpaPredictorData,
  saveGpaPredictorData,
  type CoursePrediction,
  type CourseProfile,
  type GpaPredictorData,
} from "@/lib/storage/gpa-predictor"
import { PredictionCourseCard } from "./prediction-course-card"

function defaultDraft(): PredictionDraft {
  return {
    mode: "components",
    regular: { kind: "raw", maxScore: 100, weight: 0.3 },
    final: { kind: "raw", maxScore: 100, weight: 0.7 },
  }
}

function defaultPrediction(): CoursePrediction {
  return { included: false, draft: defaultDraft() }
}

function parseNumber(value: string): number | undefined {
  if (!value.trim()) return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

export default function GpaPredictorPage() {
  const accountScope = useAuthStore((state) => state.cacheNamespace)
  const username = useAuthStore((state) => state.username)
  const authHydrated = useAuthStore((state) => state.hasHydrated)
  const gradesQuery = useGrades()
  const scheduleQuery = useSchedule({ courseCategory: "all", includeLabSchedule: true })
  const currentWeekQuery = useCurrentWeek()
  const gpaQuery = useGPAStats()
  const currentSemester = currentWeekQuery.data?.semester ?? ""
  const [data, setData] = useState<GpaPredictorData>(() => emptyPredictorData())
  const [hydrated, setHydrated] = useState(false)
  const [customName, setCustomName] = useState("")
  const [customSemester, setCustomSemester] = useState("")
  const [customCredit, setCustomCredit] = useState("")
  const [customDegree, setCustomDegree] = useState<CourseProfile["degreeStatus"]>("unknown")
  const [selectedCourseId, setSelectedCourseId] = useState<string>()

  useEffect(() => {
    if (!authHydrated || !accountScope) return
    setData(loadGpaPredictorData(accountScope))
    setHydrated(true)
  }, [accountScope, authHydrated])

  const persist = useCallback(
    (mutate: (draft: GpaPredictorData) => void) => {
      if (!accountScope) return
      setData((previous) => {
        const next = clonePredictionData(previous)
        mutate(next)
        saveGpaPredictorData(accountScope, next)
        return next
      })
    },
    [accountScope]
  )

  const scheduleWithManual = useMemo(() => {
    if (!currentSemester) return scheduleQuery.data ?? []
    return [
      ...(scheduleQuery.data ?? []),
      ...loadManualCourses(username || "local", currentSemester),
    ]
  }, [currentSemester, scheduleQuery.data, username])

  useEffect(() => {
    if (!hydrated || !currentSemester || !accountScope) return
    const profiles = mergeCourseProfiles(
      data.profiles,
      gradesQuery.data ?? [],
      scheduleWithManual,
      currentSemester
    )
    if (JSON.stringify(profiles) === JSON.stringify(data.profiles)) return
    persist((draft) => {
      draft.profiles = profiles
    })
  }, [
    accountScope,
    currentSemester,
    data.profiles,
    gradesQuery.data,
    hydrated,
    persist,
    scheduleWithManual,
  ])

  const activeScenario =
    data.scenarios.find((scenario) => scenario.id === data.activeScenarioId) ?? data.scenarios[0]

  const officialGradeState = useMemo(() => {
    const map = new Map<string, Grade>()
    const ambiguous = new Set<string>()
    for (const grade of gradesQuery.data ?? []) {
      if (!grade.isMajor || grade.isRetake !== "正考" || !grade.isValid) continue
      const id = gradeEntityId(grade)
      const point = numericGradeValue(grade.numericGradePoint, grade.gradePoint)
      const credit = numericGradeValue(grade.numericCredit, grade.credit)
      if (!id || point === undefined || credit === undefined || credit <= 0) continue
      if (ambiguous.has(id)) continue
      const previous = map.get(id)
      if (previous) {
        const sameRecord =
          previous.classId === grade.classId &&
          numericGradeValue(previous.numericGradePoint, previous.gradePoint) === point &&
          numericGradeValue(previous.numericCredit, previous.credit) === credit &&
          numericGradeValue(previous.numericScore, previous.score) ===
            numericGradeValue(grade.numericScore, grade.score)
        if (sameRecord) continue
        map.delete(id)
        ambiguous.add(id)
        continue
      }
      map.set(id, grade)
    }
    return { map, ambiguous }
  }, [gradesQuery.data])
  const officialGradeMap = officialGradeState.map

  const formalRecords = useMemo(() => {
    const records: WeightedCourse[] = []
    for (const [id, grade] of officialGradeMap) {
      const profile = data.profiles[id]
      const point = numericGradeValue(grade.numericGradePoint, grade.gradePoint)
      const credit = profile
        ? effectiveCredit(profile)
        : numericGradeValue(grade.numericCredit, grade.credit)
      if (point === undefined || credit === undefined) continue
      records.push({
        point,
        credit,
        degreeStatus: profile?.degreeStatus ?? (grade.isDegreeCourse ? "degree" : "non-degree"),
      })
    }
    return records
  }, [data.profiles, officialGradeMap])

  const formalSummary = useMemo(() => weightedSummary(formalRecords), [formalRecords])

  const predictionProfiles = useMemo(
    () =>
      Object.values(data.profiles)
        .filter(
          (profile) =>
            !officialGradeMap.has(profile.id) &&
            (profile.semester === currentSemester || profile.source === "custom")
        )
        .sort((left, right) => left.name.localeCompare(right.name, "zh-CN")),
    [currentSemester, data.profiles, officialGradeMap]
  )

  const predictedRecords = useMemo(() => {
    if (!activeScenario) return []
    const records: Array<WeightedCourse & { id: string }> = []
    for (const profile of predictionProfiles) {
      const prediction = activeScenario.predictions[profile.id]
      if (!prediction?.included) continue
      const point = predictionPoint(prediction.draft, "exact")
      const credit = effectiveCredit(profile)
      if (point === null || credit === undefined || profile.degreeStatus === "unknown") continue
      records.push({ id: profile.id, point, credit, degreeStatus: profile.degreeStatus })
    }
    return records
  }, [activeScenario, predictionProfiles])

  const combinedSummary = useMemo(
    () => weightedSummary([...formalRecords, ...predictedRecords]),
    [formalRecords, predictedRecords]
  )
  const termPredictionSummary = useMemo(() => weightedSummary(predictedRecords), [predictedRecords])
  const selectedProfiles = predictionProfiles.filter(
    (profile) => activeScenario?.predictions[profile.id]?.included
  )
  const completedCount = predictedRecords.length
  const countedPredictionIds = new Set(predictedRecords.map((record) => record.id))
  const allPredictionsComplete =
    selectedProfiles.length > 0 && completedCount === selectedProfiles.length
  const target = data.targetGpa
  const futureCredits = weightedSummary(
    selectedProfiles.flatMap((profile) => {
      const credit = effectiveCredit(profile)
      return credit !== undefined && profile.degreeStatus !== "unknown"
        ? [{ point: 0, credit, degreeStatus: profile.degreeStatus }]
        : []
    })
  ).credits
  const neededAverage =
    target === undefined
      ? null
      : requiredFutureAverage(formalSummary.points, formalSummary.credits, futureCredits, target)
  const maxReachable =
    futureCredits > 0
      ? (formalSummary.points + 4.5 * futureCredits) / (formalSummary.credits + futureCredits)
      : null

  function updateProfile(profile: CourseProfile) {
    persist((draft) => {
      draft.profiles[profile.id] = profile
    })
  }

  function updatePrediction(courseId: string, prediction: CoursePrediction) {
    persist((draft) => {
      const scenario = draft.scenarios.find((item) => item.id === draft.activeScenarioId)
      if (!scenario) return
      scenario.predictions[courseId] = prediction
      scenario.updatedAt = Date.now()
    })
  }

  function deleteCustomCourse(courseId: string) {
    persist((draft) => {
      delete draft.profiles[courseId]
      for (const scenario of draft.scenarios) delete scenario.predictions[courseId]
    })
    toast.success("已删除本地课程；取消参与预测请使用卡片开关")
  }

  function addCustomCourse() {
    const name = customName.trim()
    const semester = customSemester.trim() || currentSemester
    const credit = parseNumber(customCredit)
    if (!name || !semester || credit === undefined || credit <= 0) {
      toast.error("请填写课程名称、学期和有效学分")
      return
    }
    const manualId = globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`
    const id = courseEntityId({ semester, manualId })!
    persist((draft) => {
      draft.profiles[id] = {
        id,
        name,
        semester,
        overrideCredit: credit,
        degreeStatus: customDegree,
        degreeSource: "user",
        source: "custom",
        custom: true,
      }
      const scenario = draft.scenarios.find((item) => item.id === draft.activeScenarioId)
      if (scenario) scenario.predictions[id] = { ...defaultPrediction(), included: true }
    })
    setCustomName("")
    setCustomCredit("")
    toast.success("本地课程已加入预测，不会虚构课表时段")
  }

  if (!hydrated || (gradesQuery.isLoading && !gradesQuery.data)) {
    return <Skeleton className="h-[60vh]" />
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/grades">
            <ArrowLeft />
            成绩
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>绩点预测</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          <div className="rounded-xl bg-muted p-3">
            <p className="text-xs text-muted-foreground">官方累计绩点</p>
            <p className="mt-1 text-xl font-semibold">{gpaQuery.data?.gpaInitial ?? "-"}</p>
            <p className="text-[10px] text-muted-foreground">教务系统原值</p>
          </div>
          <div className="rounded-xl bg-muted p-3">
            <p className="text-xs text-muted-foreground">同口径正式成绩</p>
            <p className="mt-1 text-xl font-semibold">{formalSummary.gpa?.toFixed(4) ?? "-"}</p>
            <p className="text-[10px] text-muted-foreground">主修·正考·本地重算</p>
          </div>
          <div className="rounded-xl bg-primary/10 p-3">
            <p className="text-xs text-muted-foreground">所选课程预测绩点</p>
            <p className="mt-1 text-xl font-semibold text-primary">
              {termPredictionSummary.gpa?.toFixed(4) ?? "-"}
            </p>
            <p className="text-[10px] text-muted-foreground">只计算已勾选且填写完成的课程</p>
          </div>
          <div className="rounded-xl bg-primary/10 p-3">
            <p className="text-xs text-muted-foreground">累计预测绩点</p>
            <p className="mt-1 text-xl font-semibold text-primary">
              {combinedSummary.gpa?.toFixed(4) ?? "-"}
            </p>
            <p className="text-[10px] text-muted-foreground">
              {completedCount}/{selectedProfiles.length} 门完成
            </p>
          </div>
          <div className="rounded-xl bg-muted p-3">
            <p className="text-xs text-muted-foreground">同口径变化</p>
            <p className="mt-1 text-xl font-semibold">
              {formalSummary.gpa !== null && combinedSummary.gpa !== null
                ? `${combinedSummary.gpa - formalSummary.gpa >= 0 ? "+" : ""}${(combinedSummary.gpa - formalSummary.gpa).toFixed(4)}`
                : "-"}
            </p>
            <p className="text-[10px] text-muted-foreground">不与不同口径官方值强比</p>
          </div>
          <p className="col-span-full text-xs text-muted-foreground">
            累计预测会保留历年已出分课程的分母；未出分且未勾选的课程完全不参与计算。
          </p>
          <p className="col-span-full rounded-lg border px-3 py-2 font-mono text-xs text-muted-foreground">
            ({formalSummary.points.toFixed(4)} + {termPredictionSummary.points.toFixed(4)}) ÷ (
            {formalSummary.credits.toFixed(4)} + {termPredictionSummary.credits.toFixed(4)}) ={" "}
            {combinedSummary.gpa?.toFixed(4) ?? "暂无结果"}
          </p>
          {!allPredictionsComplete && selectedProfiles.length > 0 && (
            <p className="col-span-full text-xs text-destructive">
              当前只是部分课程预测，不能视为完整学期结果。
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">目标倒推与预测规则</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1">
            <label className="space-y-1 text-xs text-muted-foreground">
              目标累计绩点
              <Input
                type="number"
                min={0}
                max={4.5}
                step="0.01"
                value={target ?? ""}
                onChange={(event) =>
                  persist((draft) => {
                    draft.targetGpa = parseNumber(event.target.value)
                  })
                }
              />
            </label>
            <p className="text-xs text-muted-foreground">
              固定按不取整计算；非整数总评无法自动确定档位时，请直接选择等级。
            </p>
          </div>
          {target !== undefined && (
            <div className="rounded-xl border p-3 text-sm">
              {futureCredits <= 0
                ? "请先选择课程并确认学分、学位属性。"
                : neededAverage !== null && neededAverage > 4.5
                  ? `当前所选课程内无法达到，全部取得4.5时最高约为 ${maxReachable?.toFixed(4)}。`
                  : neededAverage !== null && neededAverage <= 0
                    ? "该累计目标在所选范围内已无额外绩点要求，但课程仍需通过。"
                    : `所选后续课程需要加权平均绩点 ${neededAverage?.toFixed(4)}。`}
            </div>
          )}
          <Accordion type="single" collapsible>
            <AccordionItem value="formula">
              <AccordionTrigger>计算口径与公式</AccordionTrigger>
              <AccordionContent className="space-y-2 text-xs text-muted-foreground">
                <p>
                  仅纳入可确认的主修培养方案正考记录；学位课权重1.2，非学位课权重1。未确认属性不会静默按非学位课计算。
                </p>
                <p>
                  累计绩点 = Σ(绩点×学分×权重) ÷
                  Σ(学分×权重)。未出分和未完成预测不会按0分计入；正式成绩会替代同一课程预测。
                </p>
                {officialGradeState.ambiguous.size > 0 && (
                  <p>
                    发现 {officialGradeState.ambiguous.size}
                    门同标识但内容不同的正式成绩记录，已排除并等待人工确认，没有自动取最高分或最新成绩。
                  </p>
                )}
                <p>学校现行整数分段已内置；小数如何划档尚无已确认规则，上方选项只是预测假设。</p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">添加无课表课程</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-2">
          <Input
            className="col-span-2"
            placeholder="课程名称"
            value={customName}
            onChange={(event) => setCustomName(event.target.value)}
          />
          <Input
            placeholder={currentSemester || "学期，如2026-2027-1"}
            value={customSemester}
            onChange={(event) => setCustomSemester(event.target.value)}
          />
          <Input
            type="number"
            min={0.1}
            step="0.5"
            placeholder="学分"
            value={customCredit}
            onChange={(event) => setCustomCredit(event.target.value)}
          />
          <select
            className="h-8 rounded-lg border bg-background px-2 text-sm"
            value={customDegree}
            onChange={(event) =>
              setCustomDegree(event.target.value as CourseProfile["degreeStatus"])
            }
          >
            <option value="unknown">学位属性未确认</option>
            <option value="degree">学位课</option>
            <option value="non-degree">非学位课</option>
          </select>
          <Button onClick={addCustomCourse}>
            <Plus />
            添加并参与预测
          </Button>
          <p className="col-span-full text-xs text-muted-foreground">
            无上课时间的课程只参加预测，不会在周课表里虚构时段。
          </p>
        </CardContent>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">课程预测</h2>
          <Badge variant="outline">{predictionProfiles.length} 门可选</Badge>
        </div>
        {predictionProfiles.length === 0 ? (
          <p className="rounded-xl border p-6 text-center text-sm text-muted-foreground">
            当前课表没有可预测课程，可在上方添加本地课程。
          </p>
        ) : (
          <>
            <Card>
              <CardContent className="divide-y p-0">
                {predictionProfiles.map((profile) => {
                  const prediction = activeScenario?.predictions[profile.id] ?? defaultPrediction()
                  const point = predictionPoint(prediction.draft, "exact")
                  const credit = effectiveCredit(profile)
                  const counted = countedPredictionIds.has(profile.id)
                  const status = !prediction.included
                    ? "未选择"
                    : credit === undefined || credit <= 0
                      ? "未计入：学分待补"
                      : profile.degreeStatus === "unknown"
                        ? "未计入：学位属性待确认"
                        : point === null
                          ? "未计入：预测成绩未完成"
                          : "已计入累计计算"
                  return (
                    <div key={profile.id} className="flex items-center gap-3 px-4 py-3">
                      <Switch
                        aria-label={`选择${profile.name}参与预测`}
                        checked={prediction.included}
                        onCheckedChange={(included) =>
                          updatePrediction(profile.id, { ...prediction, included })
                        }
                      />
                      <button
                        type="button"
                        className="min-w-0 flex-1 text-left"
                        onClick={() => setSelectedCourseId(profile.id)}
                      >
                        <span className="block truncate text-sm font-medium">{profile.name}</span>
                        <span className="text-xs text-muted-foreground">
                          {credit ?? "学分待补"} 学分 ·{" "}
                          {point === null ? "待预测" : `${point.toFixed(1)} 绩点`}
                        </span>
                        <span
                          className={`block text-xs ${counted ? "text-primary" : prediction.included ? "text-destructive" : "text-muted-foreground"}`}
                        >
                          {status}
                        </span>
                      </button>
                      <Button
                        type="button"
                        size="sm"
                        variant={selectedCourseId === profile.id ? "secondary" : "ghost"}
                        onClick={() => setSelectedCourseId(profile.id)}
                      >
                        编辑
                      </Button>
                    </div>
                  )
                })}
              </CardContent>
            </Card>
            {!selectedCourseId && (
              <p className="rounded-xl border p-5 text-center text-sm text-muted-foreground">
                勾选需要预测的课程，点击“编辑”填写成绩；其他课程不进入分母。
              </p>
            )}
            {predictionProfiles
              .filter((profile) => profile.id === selectedCourseId)
              .map((profile) => {
                const prediction = activeScenario?.predictions[profile.id] ?? defaultPrediction()
                const otherRecords = predictedRecords.filter((record) => record.id !== profile.id)
                const fixed = weightedSummary([...formalRecords, ...otherRecords])
                const minimum =
                  target === undefined
                    ? null
                    : minimumLevelForTarget(
                        fixed.points,
                        fixed.credits,
                        effectiveCredit(profile) ?? 0,
                        profile.degreeStatus,
                        target
                      )
                return (
                  <PredictionCourseCard
                    key={profile.id}
                    profile={profile}
                    prediction={prediction}
                    rounding="exact"
                    minimumTargetLevel={minimum}
                    onProfileChange={updateProfile}
                    onPredictionChange={(next) => updatePrediction(profile.id, next)}
                    onDeleteCustom={
                      profile.source === "custom"
                        ? () => {
                            deleteCustomCourse(profile.id)
                            setSelectedCourseId(undefined)
                          }
                        : undefined
                    }
                  />
                )
              })}
          </>
        )}
      </div>
    </div>
  )
}
