import { describe, expect, it } from 'vitest'
import { WEEKDAYS, formatWeeklyHolidays, isWeeklyHoliday } from './weekdays'

/**
 * The numbering is the whole risk here. ISO-8601 counts Monday as 1 and Sunday
 * as 7; `Date.getDay()` counts Sunday as 0. Getting that backwards would close
 * the school on the wrong day and nothing would throw, so the days are pinned
 * to real dates rather than to each other.
 */
describe('weekday numbering', () => {
  it('numbers Sunday 0 through Saturday 6', () => {
    expect(WEEKDAYS.map((d) => d.value)).toEqual([0, 1, 2, 3, 4, 5, 6])
    // 2026-08-16 is a Sunday; the six days after it walk the rest of the week.
    for (const [offset, day] of WEEKDAYS.entries()) {
      const date = new Date(2026, 7, 16 + offset)
      expect(date.getDay()).toBe(day.value)
    }
  })
})

describe('isWeeklyHoliday', () => {
  const sunday = new Date(2026, 7, 16)
  const friday = new Date(2026, 7, 21)
  const saturday = new Date(2026, 7, 22)

  it('closes only Sunday on a six-day week', () => {
    expect(isWeeklyHoliday(sunday, [0])).toBe(true)
    expect(isWeeklyHoliday(friday, [0])).toBe(false)
    expect(isWeeklyHoliday(saturday, [0])).toBe(false)
  })

  it('closes Saturday and Sunday on a five-day week', () => {
    expect(isWeeklyHoliday(saturday, [0, 6])).toBe(true)
    expect(isWeeklyHoliday(sunday, [0, 6])).toBe(true)
    expect(isWeeklyHoliday(friday, [0, 6])).toBe(false)
  })

  it('closes Friday when that is the rule', () => {
    expect(isWeeklyHoliday(friday, [5])).toBe(true)
    expect(isWeeklyHoliday(sunday, [5])).toBe(false)
  })

  it('closes nothing on an empty rule', () => {
    expect(isWeeklyHoliday(sunday, [])).toBe(false)
    expect(isWeeklyHoliday(saturday, [])).toBe(false)
  })
})

describe('formatWeeklyHolidays', () => {
  it('reads the days back in the order of the week, not the order given', () => {
    expect(formatWeeklyHolidays([6, 0])).toBe('Minggu, Sabtu')
  })

  it('says so when school runs every day', () => {
    expect(formatWeeklyHolidays([])).toBe('Tidak ada')
  })
})
