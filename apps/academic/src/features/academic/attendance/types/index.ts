export interface AttendanceProfile {
  name?: string | null
}

export interface AttendanceUser {
  profile?: AttendanceProfile | null
}

export interface AttendanceStudent {
  id: string
  nis: string
  user?: AttendanceUser
}

export interface AttendanceEnrollment {
  id: string
  studentId: string
  classroomId: string
  semesterId: string
  student?: AttendanceStudent
}

export interface AttendanceTimeSlot {
  id: string
  name: string
  startTime: string
  endTime: string
  order: number
}

export interface AttendanceSchedule {
  id: string
  timeSlot?: AttendanceTimeSlot
}

export type AttendanceStatus =
  'PRESENT' | 'SICK' | 'EXCUSED' | 'ABSENT' | 'LATE'

export interface Attendance {
  id: string
  enrollmentId: string
  scheduleId?: string | null
  date: string
  status: AttendanceStatus
  note?: string | null
  enrollment?: AttendanceEnrollment
  schedule?: AttendanceSchedule | null
}

export interface AttendanceSavePayload {
  enrollmentId: string
  scheduleId?: string
  date: string
  status: AttendanceStatus
  note?: string
}

export interface BulkAttendanceRecord {
  enrollmentId: string
  status: AttendanceStatus
  note?: string
}

export interface BulkUpsertAttendancePayload {
  date: string
  scheduleId?: string
  records: BulkAttendanceRecord[]
}

export interface BulkUpsertAttendanceResult {
  saved: number
}

export interface AttendanceQueryParams {
  page?: number
  limit?: number
  enrollmentId?: string
  scheduleId?: string
  classroomId?: string
  semesterId?: string
  status?: AttendanceStatus
  date?: string
}

export interface AttendanceRecapItem {
  enrollmentId: string
  studentName: string
  nis: string
  PRESENT: number
  SICK: number
  EXCUSED: number
  ABSENT: number
  LATE: number
  /** Sum of all five status counts. */
  total: number
  /** (PRESENT + LATE) / total * 100, rounded to 1 decimal. */
  percentage: number
}

export interface AttendanceRecapQueryParams {
  classroomId: string
  semesterId: string
  /** Month (1-12). Omit for whole-semester recap. */
  month?: number
  /** Year, required together with month. */
  year?: number
}

export interface AttendanceTrendPoint {
  year: number
  /** 1-12. */
  month: number
  /** e.g. "Jan 2026" — ready to use as a chart x-axis label. */
  monthLabel: string
  PRESENT: number
  SICK: number
  EXCUSED: number
  ABSENT: number
  LATE: number
  total: number
  percentage: number
}

export interface AttendanceTrendQueryParams {
  classroomId: string
  semesterId: string
}

export interface AttendanceInputRow {
  enrollmentId: string
  studentName: string
  nis: string
  status: AttendanceStatus
  note: string
  existingId?: string
  /**
   * Pre-filled from the gate and not yet confirmed by a teacher. Cleared the
   * moment the teacher touches the row, because at that point it is their
   * value, not the gate's (FR-017).
   */
  fromGate?: boolean
  /** Shown when the arrival was later than the school start time (FR-021). */
  gateCheckInAt?: string | null
  /** The gate saw nothing. Needs a decision, not a default (FR-018). */
  needsDecision?: boolean
}

export interface AttendanceSuggestion {
  enrollmentId: string
  suggestedStatus: 'PRESENT' | 'LATE'
  checkInAt: string | null
  lateMinutes: number
}

export interface AttendanceSuggestionResult {
  date: string
  suggestions: AttendanceSuggestion[]
  unscannedEnrollmentIds: string[]
  /** False when presence could not be reached; the screen says so. */
  available: boolean
}
