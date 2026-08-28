import { describe, expect, it } from 'vitest'
import { toScheduleLesson } from './toScheduleLesson'

/**
 * The bug this guards against drew a full week of dashes.
 *
 * Both shapes satisfy `ScheduleLesson` — every field on it is optional — so
 * the mismatch could not be caught by types. It has to be caught here.
 */
describe('toScheduleLesson', () => {
  const apiRow = {
    day: 'MONDAY',
    timeSlotId: 'slot-3',
    teachingAssignment: {
      subject: { name: 'Matematika' },
      classroom: { name: 'Kelas VII A', code: 'VII-A' },
      teacher: { user: { profile: { name: 'Pak Ahmad' } } },
    },
  }

  it('lifts the subject, classroom and teacher out of the teaching assignment', () => {
    const lesson = toScheduleLesson(apiRow)

    expect(lesson.subject?.name).toBe('Matematika')
    expect(lesson.classroom?.code).toBe('VII-A')
    expect(lesson.teacher?.user?.profile?.name).toBe('Pak Ahmad')
  })

  it('keeps the coordinates the timetable is keyed by', () => {
    const lesson = toScheduleLesson(apiRow)

    expect(lesson.day).toBe('MONDAY')
    expect(lesson.timeSlotId).toBe('slot-3')
  })

  it('survives a row with no teaching assignment', () => {
    const lesson = toScheduleLesson({ day: 'FRIDAY', timeSlotId: 'slot-1' })

    expect(lesson.day).toBe('FRIDAY')
    expect(lesson.subject).toBeUndefined()
    expect(lesson.classroom).toBeUndefined()
    expect(lesson.teacher).toBeUndefined()
  })

  it('does not carry the nesting through', () => {
    expect(toScheduleLesson(apiRow)).not.toHaveProperty('teachingAssignment')
  })
})
