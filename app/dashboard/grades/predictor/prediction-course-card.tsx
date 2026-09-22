"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
  GPA_LEVELS,
  courseTotal,
  levelForScore,
  partContribution,
  predictionPoint,
  requiredFinalRawScore,
  scoreThresholdForLevel,
  type PredictionDraft,
  type RoundingMode,
  type ScorePart,
} from "@/lib/academic/gpa-predictor"
import {
  effectiveCredit,
  type CoursePrediction,
  type CourseProfile,
} from "@/lib/storage/gpa-predictor"

function number(value: string): number | undefined {
  if (value.trim() === "") return undefined
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : undefined
}

function NumberInput({
  value,
  onChange,
  ...props
}: Omit<React.ComponentProps<typeof Input>, "value" | "onChange"> & {
  value?: number
  onChange: (value?: number) => void
}) {
  return (
    <Input
      type="number"
      value={value ?? ""}
      onChange={(event) => onChange(number(event.target.value))}
      {...props}
    />
  )
}

function ScorePartEditor({
  label,
  part,
  onChange,
}: {
  label: string
  part: ScorePart
  onChange: (part: ScorePart) => void
}) {
  const contribution = partContribution(part)
  function changeKind(kind: ScorePart["kind"]) {
    if (kind === part.kind) return
    if (kind === "contribution") {
      onChange({ ...part, kind, score: contribution ?? undefined })
      return
    }
    const rawScore =
      part.score !== undefined && part.maxScore && part.weight > 0
        ? (part.score / (part.weight * 100)) * part.maxScore
        : undefined
    onChange({ ...part, kind, score: rawScore })
  }
  return (
    <div className="space-y-2 rounded-xl border p-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-medium">{label}</span>
        <select
          className="h-8 rounded-lg border bg-background px-2 text-xs"
          value={part.kind}
          onChange={(event) => changeKind(event.target.value as ScorePart["kind"])}
        >
          <option value="raw">原始得分</option>
          <option value="contribution">总评贡献分</option>
        </select>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <label className="space-y-1 text-xs text-muted-foreground">
          {part.kind === "raw" ? "得分" : "贡献分"}
          <NumberInput
            min={0}
            step="any"
            value={part.score}
            onChange={(score) => onChange({ ...part, score })}
          />
        </label>
        {part.kind === "raw" ? (
          <label className="space-y-1 text-xs text-muted-foreground">
            满分
            <NumberInput
              min={0.01}
              step="any"
              value={part.maxScore}
              onChange={(maxScore) => onChange({ ...part, maxScore })}
            />
          </label>
        ) : (
          <div />
        )}
        <label className="space-y-1 text-xs text-muted-foreground">
          占比%
          <NumberInput
            min={0}
            max={100}
            step="any"
            value={part.weight * 100}
            onChange={(weight) => onChange({ ...part, weight: (weight ?? 0) / 100 })}
          />
        </label>
      </div>
      <p className="text-xs text-muted-foreground">
        {contribution === null
          ? "信息不完整或超出允许范围。"
          : part.kind === "raw"
            ? `${part.score}/${part.maxScore}，占${part.weight * 100}%，计入总评 ${contribution.toFixed(2)} 分。`
            : `已折算 ${part.score}/${part.weight * 100}，计入总评 ${contribution.toFixed(2)} 分。`}
      </p>
    </div>
  )
}

export function PredictionCourseCard({
  profile,
  prediction,
  rounding,
  minimumTargetLevel,
  onProfileChange,
  onPredictionChange,
  onDeleteCustom,
}: {
  profile: CourseProfile
  prediction: CoursePrediction
  rounding: RoundingMode
  minimumTargetLevel?: (typeof GPA_LEVELS)[number] | null
  onProfileChange: (profile: CourseProfile) => void
  onPredictionChange: (prediction: CoursePrediction) => void
  onDeleteCustom?: () => void
}) {
  const credit = effectiveCredit(profile)
  const total = courseTotal(prediction.draft)
  const level = total === null ? null : levelForScore(total, rounding)
  const point = predictionPoint(prediction.draft, rounding)
  const requiredFinal = minimumTargetLevel
    ? requiredFinalRawScore(
        prediction.draft,
        scoreThresholdForLevel(minimumTargetLevel.min, rounding)
      )
    : null

  function updateDraft(patch: Partial<PredictionDraft>) {
    onPredictionChange({ ...prediction, draft: { ...prediction.draft, ...patch } })
  }

  return (
    <Card className={prediction.included ? "border-primary/40" : "opacity-80"}>
      <CardHeader className="flex flex-row items-start justify-between gap-3 pb-3">
        <div className="min-w-0">
          <CardTitle className="truncate text-base">{profile.name}</CardTitle>
          <div className="mt-1 flex flex-wrap gap-1">
            <Badge variant="outline">{profile.semester}</Badge>
            <Badge variant="secondary">
              {profile.source === "custom" ? "本地课程" : "教务课程"}
            </Badge>
            {profile.degreeStatus === "unknown" && (
              <Badge variant="destructive">学位属性未确认</Badge>
            )}
          </div>
        </div>
        <label className="flex items-center gap-2 text-xs">
          参与预测
          <Switch
            checked={prediction.included}
            onCheckedChange={(included) => onPredictionChange({ ...prediction, included })}
          />
        </label>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1 text-xs text-muted-foreground">
            有效学分
            <div className="flex gap-1">
              <NumberInput
                min={0.1}
                step="0.5"
                value={credit}
                onChange={(overrideCredit) => onProfileChange({ ...profile, overrideCredit })}
              />
              {profile.overrideCredit !== undefined && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => onProfileChange({ ...profile, overrideCredit: undefined })}
                >
                  还原
                </Button>
              )}
            </div>
            {profile.originalCredit !== undefined && (
              <span>教务原值：{profile.originalCredit}</span>
            )}
          </label>
          <label className="space-y-1 text-xs text-muted-foreground">
            学位课属性
            <select
              className="h-8 w-full rounded-lg border bg-background px-2 text-sm"
              value={profile.degreeStatus}
              onChange={(event) =>
                onProfileChange({
                  ...profile,
                  degreeStatus: event.target.value as CourseProfile["degreeStatus"],
                  degreeSource: "user",
                })
              }
            >
              <option value="unknown">未确认</option>
              <option value="degree">学位课（权重1.2）</option>
              <option value="non-degree">非学位课（权重1）</option>
            </select>
          </label>
        </div>

        {profile.source === "custom" && (
          <div className="space-y-2 rounded-xl border p-3">
            <p className="text-sm font-medium">课表时段（可选）</p>
            <div className="grid grid-cols-2 gap-2">
              <select
                className="h-8 rounded-lg border bg-background px-2 text-sm"
                value={profile.schedule?.weekDay ?? 0}
                onChange={(event) => {
                  const weekDay = Number(event.target.value)
                  onProfileChange({
                    ...profile,
                    schedule:
                      weekDay === 0
                        ? undefined
                        : {
                            weekDay,
                            startSection: profile.schedule?.startSection ?? 1,
                            endSection: profile.schedule?.endSection ?? 2,
                            weeks: profile.schedule?.weeks ?? "1-18",
                            classroom: profile.schedule?.classroom,
                            teacher: profile.schedule?.teacher,
                          },
                  })
                }}
              >
                <option value={0}>不显示在课表</option>
                {["一", "二", "三", "四", "五", "六", "日"].map((day, index) => (
                  <option key={day} value={index + 1}>
                    周{day}
                  </option>
                ))}
              </select>
              <Input
                placeholder="教室"
                value={profile.schedule?.classroom ?? ""}
                disabled={!profile.schedule}
                onChange={(event) =>
                  profile.schedule &&
                  onProfileChange({
                    ...profile,
                    schedule: { ...profile.schedule, classroom: event.target.value },
                  })
                }
              />
              <div className="flex items-center gap-1">
                <NumberInput
                  min={1}
                  max={12}
                  value={profile.schedule?.startSection}
                  disabled={!profile.schedule}
                  onChange={(startSection) =>
                    profile.schedule &&
                    onProfileChange({
                      ...profile,
                      schedule: {
                        ...profile.schedule,
                        startSection: startSection ?? 1,
                        endSection: Math.max(startSection ?? 1, profile.schedule.endSection),
                      },
                    })
                  }
                />
                <span>-</span>
                <NumberInput
                  min={1}
                  max={12}
                  value={profile.schedule?.endSection}
                  disabled={!profile.schedule}
                  onChange={(endSection) =>
                    profile.schedule &&
                    onProfileChange({
                      ...profile,
                      schedule: {
                        ...profile.schedule,
                        endSection: Math.max(
                          profile.schedule.startSection,
                          endSection ?? profile.schedule.startSection
                        ),
                      },
                    })
                  }
                />
              </div>
              <Input
                placeholder="周次，如1-18"
                value={profile.schedule?.weeks ?? ""}
                disabled={!profile.schedule}
                onChange={(event) =>
                  profile.schedule &&
                  onProfileChange({
                    ...profile,
                    schedule: { ...profile.schedule, weeks: event.target.value },
                  })
                }
              />
            </div>
            <p className="text-xs text-muted-foreground">
              添加时段后仍关联同一课程，不会重复计算绩点。
            </p>
          </div>
        )}

        <div className="flex rounded-lg bg-muted p-1">
          {(["components", "grade"] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              className={`flex-1 rounded-md px-3 py-2 text-sm ${prediction.draft.mode === mode ? "bg-background font-medium shadow-sm" : "text-muted-foreground"}`}
              onClick={() => updateDraft({ mode })}
            >
              {mode === "components" ? "平时＋期末" : "直接选等级"}
            </button>
          ))}
        </div>

        {prediction.draft.mode === "components" ? (
          <div className="space-y-3">
            <ScorePartEditor
              label="平时成绩"
              part={prediction.draft.regular}
              onChange={(regular) => updateDraft({ regular })}
            />
            <ScorePartEditor
              label="期末成绩"
              part={prediction.draft.final}
              onChange={(final) => updateDraft({ final })}
            />
            <div className="rounded-xl bg-muted p-3 text-sm">
              {total === null ? (
                <span>总评：待预测（空白成绩不会按 0 分计入）</span>
              ) : (
                <span>
                  总评 {total.toFixed(2)} ·{" "}
                  {level ? `${level.level} / ${level.point} 绩点` : "请确认小数划档规则"}
                </span>
              )}
            </div>
          </div>
        ) : (
          <label className="block space-y-1 text-xs text-muted-foreground">
            预测等级
            <select
              className="h-9 w-full rounded-lg border bg-background px-3 text-sm"
              value={prediction.draft.gradeLevel ?? ""}
              onChange={(event) => updateDraft({ gradeLevel: event.target.value || undefined })}
            >
              <option value="">待选择</option>
              {GPA_LEVELS.map((item) => (
                <option key={item.level} value={item.level}>
                  {item.level} · {item.point} · {item.min}～{item.max}分
                </option>
              ))}
            </select>
          </label>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-sm">
          <span>本课预测：{point === null ? "未完成" : `${point.toFixed(1)} 绩点`}</span>
          {minimumTargetLevel && (
            <span className="text-primary">
              达成目标最低需 {minimumTargetLevel.level}
              {requiredFinal !== null &&
                `；期末理论需${rounding === "ceil" ? "高于" : "至少"} ${requiredFinal.toFixed(2)}`}
            </span>
          )}
        </div>
        {profile.source === "custom" && onDeleteCustom && (
          <Button variant="destructive" className="w-full" onClick={onDeleteCustom}>
            删除这门本地课程
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
