"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { parseWeeks } from "./schedule-utils"
import type { Course } from "@/providers/types"

interface Props {
  open: boolean
  semester: string
  onOpenChange: (open: boolean) => void
  onSave: (course: Course) => void
}

export function ManualCourseDialog({ open, semester, onOpenChange, onSave }: Props) {
  const [name, setName] = useState("")
  const [teacher, setTeacher] = useState("")
  const [classroom, setClassroom] = useState("")
  const [weekDay, setWeekDay] = useState("1")
  const [startSection, setStartSection] = useState("1")
  const [endSection, setEndSection] = useState("2")
  const [weeks, setWeeks] = useState("1-18")

  useEffect(() => {
    if (!open) return
    setName("")
    setTeacher("")
    setClassroom("")
    setWeekDay("1")
    setStartSection("1")
    setEndSection("2")
    setWeeks("1-18")
  }, [open])

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const start = Math.max(1, Number.parseInt(startSection, 10) || 1)
    const end = Math.max(start, Number.parseInt(endSection, 10) || start)
    const weekList = parseWeeks(weeks)
    onSave({
      name: name.trim(),
      teacher: teacher.trim() || undefined,
      classroom: classroom.trim() || undefined,
      weekDay: Math.min(7, Math.max(1, Number.parseInt(weekDay, 10) || 1)),
      startSection: start,
      endSection: end,
      weeks: weeks.trim() || undefined,
      weekList,
      raw: {
        __manual: true,
        semester,
        id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
      },
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>添加自定义课程</DialogTitle>
          <DialogDescription>只保存在本机，不会写入燕山大学教务系统。</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <FieldGroup className="grid grid-cols-2 gap-3">
            <Field className="col-span-2">
              <FieldLabel htmlFor="manual-course-name">课程名称</FieldLabel>
              <Input
                id="manual-course-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="manual-course-classroom">地点</FieldLabel>
              <Input
                id="manual-course-classroom"
                value={classroom}
                onChange={(e) => setClassroom(e.target.value)}
                placeholder="如：东校区 101"
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="manual-course-teacher">老师</FieldLabel>
              <Input
                id="manual-course-teacher"
                value={teacher}
                onChange={(e) => setTeacher(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="manual-course-day">星期</FieldLabel>
              <select
                id="manual-course-day"
                value={weekDay}
                onChange={(e) => setWeekDay(e.target.value)}
                className="h-8 rounded-lg border border-input bg-transparent px-2 text-sm"
              >
                {["一", "二", "三", "四", "五", "六", "日"].map((day, index) => (
                  <option key={day} value={index + 1}>
                    周{day}
                  </option>
                ))}
              </select>
            </Field>
            <Field>
              <FieldLabel>节次（起止）</FieldLabel>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={1}
                  max={12}
                  value={startSection}
                  onChange={(e) => setStartSection(e.target.value)}
                  aria-label="开始节次"
                />
                <span>-</span>
                <Input
                  type="number"
                  min={1}
                  max={12}
                  value={endSection}
                  onChange={(e) => setEndSection(e.target.value)}
                  aria-label="结束节次"
                />
              </div>
            </Field>
            <Field className="col-span-2">
              <FieldLabel htmlFor="manual-course-weeks">上课周次</FieldLabel>
              <Input
                id="manual-course-weeks"
                value={weeks}
                onChange={(e) => setWeeks(e.target.value)}
                placeholder="如：1-16,18"
              />
            </Field>
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              取消
            </Button>
            <Button type="submit" disabled={!name.trim()}>
              保存课程
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
