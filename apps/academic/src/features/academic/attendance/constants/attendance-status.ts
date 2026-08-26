import type { AttendanceStatus } from '../types'

/**
 * The five marks a register can carry, with the words the school uses.
 *
 * One list, because there were two: the per-row picker in
 * `attendanceInputColumns.ts` and the bulk picker in `AttendanceInputTable.vue`
 * each spelled out all five. Two lists of the same five values drift the moment
 * a sixth is added — one picker offers it, the other silently does not.
 */
export const ATTENDANCE_STATUS_OPTIONS: {
  value: AttendanceStatus
  label: string
}[] = [
  { value: 'PRESENT', label: 'Hadir' },
  { value: 'SICK', label: 'Sakit' },
  { value: 'EXCUSED', label: 'Izin' },
  { value: 'ABSENT', label: 'Alpa' },
  { value: 'LATE', label: 'Terlambat' },
]

/**
 * Narrow whatever the picker emitted to a mark, or nothing.
 *
 * Reka UI's `Select` emits `AcceptableValue` — a string, a number, an object,
 * or null. Declaring the handler as `(val: string)` did not make it one; it
 * made the call fail to type-check, and casting it would have been a claim
 * about the shape rather than a check of it.
 */
export function toAttendanceStatus(value: unknown): AttendanceStatus | null {
  const match = ATTENDANCE_STATUS_OPTIONS.find(
    (option) => option.value === value,
  )
  return match?.value ?? null
}
