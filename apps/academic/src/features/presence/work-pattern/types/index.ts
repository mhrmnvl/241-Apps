export interface WorkPatternDay {
  id?: string
  /** 0 = Sunday … 6 = Saturday */
  weekday: number
  isWorkingDay: boolean
  startTime: string
  endTime: string
}

export interface WorkPattern {
  id: string
  name: string
  isDefault: boolean
  graceMinutes: number
  days: WorkPatternDay[]
}

export interface WorkPatternAssignment {
  id: string
  userId: string
  workPatternId: string
  patternName: string
  effectiveFrom: string
  effectiveTo: string | null
  holder: { id: string; identifier: string; displayName: string | null }
}

export interface NonWorkingDay {
  id: string
  date: string
  name: string
  sourceCalendarId: string | null
}

export interface AttendancePeriod {
  id: string
  year: number
  month: number
  status: 'OPEN' | 'CLOSED'
  closedAt: string | null
}

/** What the close endpoint returns when it refuses. */
export interface IncompleteRecord {
  userId: string
  displayName: string | null
  date: string
}

export const WEEKDAY_LABEL = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
]

/** A complete week, so a new pattern always starts valid. */
export function defaultWeek(): WorkPatternDay[] {
  return WEEKDAY_LABEL.map((_, weekday) => ({
    weekday,
    isWorkingDay: weekday !== 0,
    startTime: '07:00',
    endTime: weekday === 5 ? '11:30' : '14:00',
  }))
}
