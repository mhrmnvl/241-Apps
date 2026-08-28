import type { ScheduleDay, ScheduleLessonMap, ScheduleTimeSlot } from '../types'

/**
 * Whether a period happens on a given day.
 *
 * Empty means every day — right for the breaks, which the school takes daily.
 * The flag ceremony is the exception the field exists for: without asking this,
 * a Monday ceremony was drawn across Senin to Sabtu.
 */
export function appliesOn(slot: ScheduleTimeSlot, day: string): boolean {
  const days = slot.days ?? []
  return days.length === 0 || days.includes(day)
}

/**
 * What a free period prints as.
 *
 * An en-dash, the same mark the table on screen puts there. A cell left truly
 * blank reads as a column that failed to load; a dash says the school teaches
 * nothing then, which is a fact about the timetable rather than about the
 * paper.
 */
export const FREE_PERIOD = '–'

/** Minutes since midnight, so two periods can be compared for overlap. */
function minutesOf(value: string): number {
  if (!value) return 0

  const parsed = new Date(value)
  if (!Number.isNaN(parsed.getTime())) {
    return parsed.getUTCHours() * 60 + parsed.getUTCMinutes()
  }

  const [hours, mins] = value.slice(0, 5).split(':')
  return (Number(hours) || 0) * 60 + (Number(mins) || 0)
}

function overlaps(a: ScheduleTimeSlot, b: ScheduleTimeSlot): boolean {
  return (
    minutesOf(a.startTime) < minutesOf(b.endTime) &&
    minutesOf(b.startTime) < minutesOf(a.endTime)
  )
}

/** One box in the grid. */
export interface SheetCell {
  title: string
  /** The class, or the teacher — whichever the reader is not already looking at. */
  subtitle?: string
  /** A ceremony standing in a teaching period. Tinted, not taught. */
  isInterruption?: boolean
}

export interface SheetRow {
  period: string
  time: string
  /** A break or tahfidz row: no lessons in it at all. */
  isInterruption: boolean
  /**
   * One cell across every day.
   *
   * A break the whole school takes at the same hour is one fact, not six —
   * printing "Istirahat Pertama" six times across a row says nothing the first
   * one did not. Set only where the period has no day restriction.
   */
  spansAllDays: boolean
  /** `days.length` cells, or exactly one when `spansAllDays`. */
  cells: SheetCell[]
}

export interface ScheduleSheet {
  title: string
  subtitle: string
  dayLabels: string[]
  rows: SheetRow[]
}

export interface BuildSheetInput {
  title: string
  subtitle: string
  days: ScheduleDay[]
  timeSlots: ScheduleTimeSlot[]
  lessonMap: ScheduleLessonMap
  /**
   * Whose sheet this is. A teacher's own timetable names the class under each
   * subject; a class's timetable names the teacher. Printing both would repeat
   * what the heading already says.
   */
  isPersonal: boolean
}

function clock(value: string): string {
  if (!value) return ''
  const parsed = new Date(value)
  if (!Number.isNaN(parsed.getTime())) {
    const h = String(parsed.getUTCHours()).padStart(2, '0')
    const m = String(parsed.getUTCMinutes()).padStart(2, '0')
    return `${h}.${m}`
  }
  return String(value).slice(0, 5).replace(':', '.')
}

/**
 * The timetable as a grid of text, once, for every way it leaves the screen.
 *
 * The printed sheet and the saved image are the same table, and building each
 * from the raw lessons separately is how they drift: one gains a column, the
 * other keeps showing last month's layout, and nobody notices until a parent is
 * holding the wrong one. So the shape is decided here and both draw it.
 *
 * Two rules about the periods that are not lessons, both of which the table on
 * screen already follows:
 *
 *   - **A period that overlaps teaching hours is drawn inside them.** The flag
 *     ceremony runs 07.30 to 08.30 on a Monday, which is Jam Ke-1 and Jam Ke-2
 *     exactly. Given a row of its own it floats to the top of the sheet — it is
 *     ordered first — and then the same hour appears twice, once as a ceremony
 *     and once as two teaching periods. So it loses its row and occupies the
 *     Monday cells of the periods it covers.
 *   - **A period the whole school takes every day is one cell, not six.**
 *     Tahfidz and the three breaks apply to every day; printing each of them
 *     across six columns says nothing the first column did not.
 */
export function buildScheduleSheet({
  title,
  subtitle,
  days,
  timeSlots,
  lessonMap,
  isPersonal,
}: BuildSheetInput): ScheduleSheet {
  const lessonSlots = timeSlots.filter((slot) => slot.isLesson !== false)
  const interruptions = timeSlots.filter((slot) => slot.isLesson === false)

  // Which teaching period, on which day, is taken by something else.
  const overlay: Record<string, Record<string, ScheduleTimeSlot>> = {}
  const absorbed = new Set<string>()

  for (const interruption of interruptions) {
    for (const lesson of lessonSlots) {
      if (!overlaps(interruption, lesson)) continue
      absorbed.add(interruption.id)

      for (const day of days) {
        if (!appliesOn(interruption, day.value)) continue
        overlay[lesson.id] ??= {}
        overlay[lesson.id][day.value] = interruption
      }
    }
  }

  const rows: SheetRow[] = timeSlots
    .filter((slot) => !absorbed.has(slot.id))
    .map((slot) => {
      const time = `${clock(slot.startTime)} - ${clock(slot.endTime)}`
      // The period's own name, not its type's.
      //
      // A type is named in English — `Ceremony`, `Break` — because the backend
      // is written in English and the frontend is what translates. The period
      // beside it is named by the school: `Upacara`, `Istirahat Pertama`. So
      // the school's word is the one that belongs on the school's timetable,
      // and reaching for the type printed a sheet half in English.
      const label = slot.name

      if (slot.isLesson === false) {
        const everyDay = (slot.days ?? []).length === 0

        return {
          period: slot.name,
          time,
          isInterruption: true,
          spansAllDays: everyDay,
          cells: everyDay
            ? [{ title: label }]
            : days.map((day) => ({
                title: appliesOn(slot, day.value) ? label : '',
              })),
        }
      }

      return {
        period: slot.name,
        time,
        isInterruption: false,
        spansAllDays: false,
        cells: days.map((day) => {
          const taken = overlay[slot.id]?.[day.value]
          if (taken) {
            return { title: taken.name, isInterruption: true }
          }

          const lesson = lessonMap[slot.id]?.[day.value]
          if (!lesson) return { title: FREE_PERIOD }

          return {
            title: lesson.subject?.name ?? '',
            subtitle: isPersonal
              ? (lesson.classroom?.code ?? lesson.classroom?.name ?? undefined)
              : (lesson.teacher?.user?.profile?.name ?? undefined),
          }
        }),
      }
    })

  return {
    title,
    subtitle,
    dayLabels: days.map((day) => day.label),
    rows,
  }
}
