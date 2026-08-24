export type PresenceDayStatus =
  'PRESENT' | 'LATE' | 'ABSENT' | 'ON_LEAVE' | 'OFFICIAL_DUTY' | 'NOT_EXPECTED'

export type PresenceValueSource = 'SCAN' | 'MANUAL'

export interface DailyPresenceHolder {
  id: string
  identifier: string
  displayName: string | null
}

export interface DailyPresence {
  id: string
  userId: string
  subjectType: 'STUDENT' | 'EMPLOYEE'
  date: string
  checkInAt: string | null
  checkOutAt: string | null
  checkInSource: PresenceValueSource | null
  checkOutSource: PresenceValueSource | null
  status: PresenceDayStatus
  statusSource: PresenceValueSource
  lateMinutes: number
  earlyLeaveMinutes: number
  note: string | null
  holder: DailyPresenceHolder
  /** True when any correction exists — resolved server-side in one query. */
  corrected: boolean
}

export interface PresenceCorrection {
  id: string
  field: 'checkInAt' | 'checkOutAt' | 'status' | 'note'
  previousValue: string | null
  newValue: string | null
  reason: string
  createdAt: string
  actor: { id: string; displayName: string | null }
}

export interface DailyPresenceDetail extends Omit<
  DailyPresence,
  'holder' | 'corrected'
> {
  corrections: PresenceCorrection[]
}

export interface PresenceRecapRow {
  userId: string
  displayName: string | null
  presentDays: number
  absentDays: number
  lateCount: number
  lateMinutes: number
  earlyLeaveCount: number
  leaveDays: number
  officialDutyDays: number
  attendanceRate: number
}

export interface PresenceRecap {
  period: {
    year: number
    month: number
    status: 'OPEN' | 'CLOSED'
    workingDays: number
  }
  rows: PresenceRecapRow[]
}

export interface MyPresence {
  year: number
  month: number
  days: Omit<DailyPresence, 'holder' | 'corrected'>[]
}

export interface CorrectPresencePayload {
  checkInAt?: string | null
  checkOutAt?: string | null
  status?: PresenceDayStatus
  note?: string | null
  /** Required by the API — a correction with no reason is refused. */
  reason: string
}

export interface CreatePresencePayload {
  userId: string
  subjectType: 'STUDENT' | 'EMPLOYEE'
  date: string
  status: PresenceDayStatus
  checkInAt?: string
  checkOutAt?: string
  note?: string
  reason: string
}

export const DAY_STATUS_LABEL: Record<PresenceDayStatus, string> = {
  PRESENT: 'Hadir',
  LATE: 'Terlambat',
  ABSENT: 'Alpa',
  ON_LEAVE: 'Izin/Cuti',
  OFFICIAL_DUTY: 'Dinas Luar',
  NOT_EXPECTED: 'Bukan hari kerja',
}

/**
 * A day that needs someone to look at it: exactly one of the two times is
 * present. Both present is a complete day; neither is an ordinary absence,
 * which needs a decision rather than a fix.
 */
export function isAnomalousDay(day: {
  checkInAt: string | null
  checkOutAt: string | null
}): boolean {
  return Boolean(day.checkInAt) !== Boolean(day.checkOutAt)
}

/**
 * Someone scanned on a day they had approved leave for.
 *
 * The scan is kept rather than discarded (FR-034) — it happened, and dropping
 * it would leave the record disagreeing with the gate. But the status stays
 * `ON_LEAVE`, because that is what payroll reads, so the disagreement has to be
 * visible here or nobody ever resolves it.
 */
export function hasLeaveConflict(day: {
  status: PresenceDayStatus
  checkInAt: string | null
}): boolean {
  return (
    (day.status === 'ON_LEAVE' || day.status === 'OFFICIAL_DUTY') &&
    day.checkInAt !== null
  )
}
