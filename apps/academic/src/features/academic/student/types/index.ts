export interface ClassroomLevelOption {
  id: string
  level: number
  name: string
  isActive: boolean
}

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
  classroomLevelId: string
  capacity: number
  isActive: boolean
}

export interface Student {
  id: string
  nis: string
  nisn: string
  status: string
  classroomLevelId: string | null
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
  classroomLevelId?: string
  classroomId?: string
  nis: string
  nisn: string
}

export interface StudentUpdatePayload {
  classroomLevelId?: string
  classroomId?: string
  nis?: string
  nisn?: string
}

export interface StudentExportParams {
  search?: string
  classroomId?: string
  isActive?: boolean
}

export interface StudentAccountUpdatePayload {
  isActive: boolean
  password?: string
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

export interface BulkImportResult {
  total: number
  success: number
  failed: number
  results: {
    row: number
    status: string
    identifier?: string
    error?: string
  }[]
}

export interface StudentColumnActions {
  onView?: (student: Student) => void
  onEdit?: (student: Student) => void
  onViewDetail?: (student: Student) => void
  onDelete?: (
    student: Student,
    callbacks: { closeAlert: () => void; setLoading: (s: boolean) => void },
  ) => Promise<void>
  showActions?: boolean
}
