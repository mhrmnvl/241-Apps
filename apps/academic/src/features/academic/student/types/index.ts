import type { AddressSavePayload } from '@/features/platform/address'
import type { IncomeRange } from '@/features/academic/parent'

export interface GradeOption {
  id: string
  level: number
  name: string
  isActive: boolean
}

export type ClassroomLevelOption = GradeOption

export interface StudentProfile {
  id: string
  name: string
  nik: string | null
  gender: string
  birthPlace: string
  birthDate: string
  email: string | null
  phone: string | null
}

export interface StudentUser {
  id: string
  identifier: string
  password?: string
  roles: string[]
  isActive: boolean
  profile: StudentProfile
}

export interface StudentClassroom {
  id: string
  code: string
  name: string
  gradeId: string
  capacity: number
  isActive: boolean
}

export interface Student {
  id: string
  nis: string
  nisn: string
  status: string
  gradeId: string | null
  classroomLevelId?: string | null
  user: StudentUser
  enrollments?: StudentEnrollmentRef[]
}

export interface StudentEnrollmentRef {
  id: string
  studentId: string
  classroomId: string
  semesterId: string
  status: string
  enrolledAt: string
  classroom?: StudentClassroom | null
}

export interface StudentQueryParams {
  page?: number
  limit?: number
  search?: string
  semesterId?: string
  classroomId?: string
  status?: string
  isActive?: boolean
}

export interface StudentSavePayload {
  identifier?: string
  password?: string
  name: string
  nik: string
  gender: string
  birthPlace: string
  birthDate: string
  email?: string
  phone?: string
  gradeId?: string
  classroomId?: string
  nis?: string
  nisn?: string
}

export interface StudentUpdatePayload {
  gradeId?: string
  classroomId?: string
  nis?: string
  nisn?: string
}

export interface StudentCreateResult {
  id: string
  userId: string
  nis: string
  nisn: string
  status: string
  gradeId?: string
}

export interface StudentParentInput {
  relation: string
  name: string
  nik: string
  birthPlace: string
  birthDate: string
  email?: string
  phone?: string
  occupationId: string
  income?: IncomeRange
  isPrimary?: boolean
}

// Flat payload matching POST /students/with-relations DTO
export interface CreateStudentWithRelationsInput extends StudentSavePayload {
  address?: AddressSavePayload | null
  parents?: StudentParentInput[]
}

export interface StudentExportParams {
  search?: string
  classroomId?: string
  isActive?: boolean
}

export interface StudentAccountUpdatePayload {
  isActive: boolean
}

export interface StudentAccountEditData {
  user?: {
    isActive?: boolean
    profile?: { name?: string }
  }
}

export interface StudentIdentityData {
  nis?: string
  nisn?: string
}

export interface BulkImportStudentRow {
  identifier: string
  password: string
  name: string
  nik: string
  gender: string
  birthPlace: string
  birthDate: string
  email?: string
  phone?: string
  grade?: number
  classroomCode?: string
  nis: string
  nisn: string
}

export interface BulkImportRowResult {
  row: number
  status: 'SUCCESS' | 'FAILED' | 'CONFLICT'
  identifier?: string
  error?: string
  existingId?: string
  data?: BulkImportStudentRow
}

export interface BulkImportResult {
  total: number
  success: number
  failed: number
  conflict: number
  results: BulkImportRowResult[]
}

export interface ResolveBulkImportConflict {
  existingId?: string
  action: 'update' | 'skip'
  data: BulkImportStudentRow
}

export interface ResolveBulkImportResult {
  total: number
  updated: number
  skipped: number
  errors: { existingId: string; error: string }[]
}

export interface StudentColumnActions {
  onView?: (student: Student) => void
  onEdit?: (student: Student) => void
  onViewDetail?: (student: Student) => void
  onDelete?: (
    student: Student,
    callbacks: { closeAlert: () => void; setLoading: (s: boolean) => void },
  ) => Promise<void>
  onToggleActive?: (student: Student, isActive: boolean) => Promise<void>
  showActions?: boolean
  canUpdate?: boolean
  canDelete?: boolean
}
