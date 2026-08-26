import type { ScheduleLesson } from '../types'

/**
 * One lesson as the API sends it.
 *
 * The subject, the classroom and the teacher all hang off the teaching
 * assignment, because that is the row that says "this teacher takes this
 * subject in this class". A schedule row only says when.
 */
export interface ScheduleApiRow {
  day: string
  timeSlotId?: string
  teachingAssignment?: {
    subject?: { name?: string }
    classroom?: { name?: string; code?: string; displayName?: string }
    teacher?: { user?: { profile?: { name?: string } } }
  }
}

/**
 * Flatten one lesson into what the timetable draws.
 *
 * The table reads `lesson.subject.name`; the API answers with
 * `lesson.teachingAssignment.subject.name`. Nothing bridged the two, so every
 * cell that held a lesson rendered its fallback dash — a timetable with the
 * right shape, the right number of rows, and no subject written in any of
 * them.
 *
 * TypeScript could not object: `ScheduleLesson` declares every field optional,
 * so an API row satisfies it structurally with all three simply absent. That
 * is why this conversion is a named step rather than an assignment — the two
 * shapes are different, and saying so out loud is the only thing that keeps
 * them from being confused again.
 */
export function toScheduleLesson(row: ScheduleApiRow): ScheduleLesson {
  return {
    timeSlotId: row.timeSlotId,
    day: row.day,
    subject: row.teachingAssignment?.subject,
    teacher: row.teachingAssignment?.teacher,
    classroom: row.teachingAssignment?.classroom,
  }
}
