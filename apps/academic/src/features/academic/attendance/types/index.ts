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
  | 'PRESENT'
  | 'SICK'
  | 'EXCUSED'
  | 'ABSENT'
  | 'LATE'

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
}

export interface AttendanceRecapQueryParams {
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
}
