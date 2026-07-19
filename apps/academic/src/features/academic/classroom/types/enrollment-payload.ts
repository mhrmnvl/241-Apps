import type { EnrollmentStatus } from './enrollment'

export interface CreateEnrollmentPayload {
  studentId: string
  classroomId: string
  semesterId: string
}

export interface BulkCreateEnrollmentPayload {
  enrollments: CreateEnrollmentPayload[]
}

export interface TransferPayload {
  targetClassroomId: string
  note?: string
}

export interface BulkTransferPayload {
  enrollmentIds: string[]
  targetClassroomId: string
  note?: string
}

export interface BulkTransferResponse {
  successCount: number
  failCount: number
}

export interface DropPayload {
  note?: string
}

export interface EnrollmentQueryParams {
  page?: number
  limit?: number
  studentId?: string
  classroomId?: string
  semesterId?: string
  academicYearId?: string
  status?: EnrollmentStatus
}

export interface BulkEnrollResponse {
  created: number
  skipped: number
}
