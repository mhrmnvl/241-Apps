import { describe, expect, it } from 'vitest'
import { appliesOn, buildScheduleSheet, FREE_PERIOD } from './scheduleSheet'
import type { ScheduleDay, ScheduleTimeSlot } from '../types'

const DAYS: ScheduleDay[] = [
  { value: 'MONDAY', label: 'Senin' },
  { value: 'TUESDAY', label: 'Selasa' },
]

const lessonSlot: ScheduleTimeSlot = {
  id: 'slot-1',
  name: 'Jam Ke-1',
  startTime: '1970-01-01T07:30:00.000Z',
  endTime: '1970-01-01T08:00:00.000Z',
  isLesson: true,
}

const ceremony: ScheduleTimeSlot = {
  id: 'slot-0',
  name: 'Upacara',
  startTime: '1970-01-01T07:30:00.000Z',
  endTime: '1970-01-01T08:30:00.000Z',
  isLesson: false,
  typeName: 'Ceremony',
  days: ['MONDAY'],
}

const base = {
  title: 'Jadwal Pelajaran Kelas VII-A',
  subtitle: 'SIAKAD 241',
  days: DAYS,
  isPersonal: false,
}

describe('appliesOn', () => {
  it('treats an empty day list as every day', () => {
    expect(appliesOn({ ...ceremony, days: [] }, 'TUESDAY')).toBe(true)
  })

  it('holds the ceremony to the day it happens', () => {
    expect(appliesOn(ceremony, 'MONDAY')).toBe(true)
    expect(appliesOn(ceremony, 'TUESDAY')).toBe(false)
  })
})

describe('buildScheduleSheet', () => {
  it('names the teacher under a class timetable', () => {
    const sheet = buildScheduleSheet({
      ...base,
      timeSlots: [lessonSlot],
      lessonMap: {
        'slot-1': {
          MONDAY: {
            day: 'MONDAY',
            subject: { name: 'Matematika' },
            teacher: { user: { profile: { name: 'Pak Ahmad' } } },
            classroom: { code: 'VII-A' },
          },
        },
      },
    })

    expect(sheet.rows[0].cells[0]).toEqual({
      title: 'Matematika',
      subtitle: 'Pak Ahmad',
    })
  })

  it("names the class under a teacher's own timetable", () => {
    const sheet = buildScheduleSheet({
      ...base,
      isPersonal: true,
      timeSlots: [lessonSlot],
      lessonMap: {
        'slot-1': {
          MONDAY: {
            day: 'MONDAY',
            subject: { name: 'Matematika' },
            teacher: { user: { profile: { name: 'Pak Ahmad' } } },
            classroom: { code: 'VII-A' },
          },
        },
      },
    })

    expect(sheet.rows[0].cells[0].subtitle).toBe('VII-A')
  })

  it('marks a period with no lesson with a dash, as the screen does', () => {
    const sheet = buildScheduleSheet({
      ...base,
      timeSlots: [lessonSlot],
      lessonMap: {},
    })

    expect(sheet.rows[0].cells).toEqual([
      { title: FREE_PERIOD },
      { title: FREE_PERIOD },
    ])
  })

  it('leaves an interruption blank on the days it does not happen', () => {
    const sheet = buildScheduleSheet({
      ...base,
      timeSlots: [ceremony],
      lessonMap: {},
    })

    expect(sheet.rows[0].cells[1].title).toBe('')
  })

  it('prints an interruption only on the days it happens', () => {
    const sheet = buildScheduleSheet({
      ...base,
      timeSlots: [ceremony],
      lessonMap: {},
    })

    expect(sheet.rows[0].isInterruption).toBe(true)
    expect(sheet.rows[0].cells.map((c) => c.title)).toEqual(['Upacara', ''])
  })

  it('reads the clock off a stored time', () => {
    const sheet = buildScheduleSheet({
      ...base,
      timeSlots: [lessonSlot],
      lessonMap: {},
    })

    expect(sheet.rows[0].time).toBe('07.30 - 08.00')
  })

  it('draws a ceremony inside the periods it covers, not above them', () => {
    const secondPeriod: ScheduleTimeSlot = {
      ...lessonSlot,
      id: 'slot-2',
      name: 'Jam Ke-2',
      startTime: '1970-01-01T08:00:00.000Z',
      endTime: '1970-01-01T08:30:00.000Z',
    }

    const sheet = buildScheduleSheet({
      ...base,
      timeSlots: [ceremony, lessonSlot, secondPeriod],
      lessonMap: {},
    })

    // No row of its own — it was floating to the top of the sheet, because it
    // is ordered first and runs over the two periods below it.
    expect(sheet.rows.map((row) => row.period)).toEqual([
      'Jam Ke-1',
      'Jam Ke-2',
    ])

    // Monday's two periods are the ceremony; Tuesday's are free.
    expect(sheet.rows[0].cells[0]).toEqual({
      title: 'Upacara',
      isInterruption: true,
    })
    expect(sheet.rows[1].cells[0].title).toBe('Upacara')
    expect(sheet.rows[0].cells[1].title).toBe(FREE_PERIOD)
  })

  it('writes a break the whole school takes once, across the week', () => {
    const breakSlot: ScheduleTimeSlot = {
      id: 'slot-break',
      name: 'Istirahat Pertama',
      startTime: '1970-01-01T09:00:00.000Z',
      endTime: '1970-01-01T09:15:00.000Z',
      isLesson: false,
      typeName: 'Break',
    }

    const sheet = buildScheduleSheet({
      ...base,
      timeSlots: [breakSlot],
      lessonMap: {},
    })

    expect(sheet.rows[0].spansAllDays).toBe(true)
    expect(sheet.rows[0].cells).toEqual([{ title: 'Istirahat Pertama' }])
  })

  it('carries the heading and the day labels through', () => {
    const sheet = buildScheduleSheet({ ...base, timeSlots: [], lessonMap: {} })

    expect(sheet.title).toBe('Jadwal Pelajaran Kelas VII-A')
    expect(sheet.dayLabels).toEqual(['Senin', 'Selasa'])
  })
})
