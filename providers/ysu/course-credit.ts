type CreditedCourse = {
  readonly code?: string | null
  readonly name?: string | null
  readonly courseCode?: string | null
  readonly courseName?: string | null
  readonly credit?: string | null
}

function normalizedName(value: string | null | undefined): string {
  return (value ?? "").replace(/[\s（）()]/g, "").toLocaleLowerCase("zh-CN")
}

function uniqueCredit(rows: readonly CreditedCourse[]): string | undefined {
  const credits = new Map<number | string, string>()
  for (const row of rows) {
    const credit = row.credit?.trim()
    if (!credit) continue
    const numeric = Number(credit)
    credits.set(Number.isFinite(numeric) ? numeric : credit, credit)
  }
  return credits.size === 1 ? credits.values().next().value : undefined
}

export function fillScheduleCredits<T extends CreditedCourse>(
  courses: readonly T[],
  plan: readonly CreditedCourse[]
): T[] {
  const byCode = new Map<string, CreditedCourse[]>()
  const byName = new Map<string, CreditedCourse[]>()

  for (const row of plan) {
    const code = (row.courseCode ?? row.code)?.trim()
    const name = normalizedName(row.courseName ?? row.name)
    if (code) byCode.set(code, [...(byCode.get(code) ?? []), row])
    if (name) byName.set(name, [...(byName.get(name) ?? []), row])
  }

  return courses.map((course) => {
    const code = (course.courseCode ?? course.code)?.trim()
    const credit =
      (code ? uniqueCredit(byCode.get(code) ?? []) : undefined) ??
      uniqueCredit(byName.get(normalizedName(course.courseName ?? course.name)) ?? [])
    return credit ? { ...course, credit } : { ...course }
  })
}
