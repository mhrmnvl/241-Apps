import type { AddressSavePayload } from '@/features/platform/address'

export interface EmploymentTypeOption {
  id: string
  code: string
  name: string
}

export interface TeacherProfile {
  id: string
  name: string
  nik: string | null
  gender: string
  birthPlace: string
  birthDate: string
  email: string | null
  phone: string | null
}

export interface TeacherUser {
  id: string
  identifier: string
  password?: string
  roles: string[]
  isActive: boolean
  profile: TeacherProfile
}

export interface TeacherPosition {
  id: string
  isPrimary: boolean
  hireDate: string
  position: {
    id: string
    name: string
    category: {
      id: string
      code: string
      name: string
    }
    isActive: boolean
  }
}

export interface Teacher {
  id: string
  nip: string | null
  nuptk: string | null
  employmentType: EmploymentTypeOption
  isActive: boolean
  user: TeacherUser
  teacherPositions: TeacherPosition[]
}

export interface TeacherQueryParams {
  page?: number
  limit?: number
  search?: string
  employmentTypeId?: string
  academicYearId?: string
  isActive?: boolean
}

export interface TeacherExportParams {
  search?: string
  employmentTypeId?: string
  isActive?: boolean
}

export interface TeacherSavePayload {
  identifier?: string
  password?: string
  name: string
  nik: string
  gender: 'MALE' | 'FEMALE'
  birthPlace: string
  birthDate: string
  email?: string
  phone?: string
  nip?: string
  nuptk?: string
  employmentTypeId: string
  positionId?: string
}

export interface TeacherUpdatePayload {
  nip?: string
  nuptk?: string
  employmentTypeId?: string
}

export interface TeacherPositionSavePayload {
  positionId: string
  hireDate: string
  isPrimary?: boolean
}

export interface TeacherPositionInput {
  positionId: string
  hireDate: string
  isPrimary: boolean
}

export interface CreateTeacherWithRelationsInput {
  core: TeacherSavePayload
  address?: AddressSavePayload | null
  positions?: TeacherPositionInput[]
}

export interface CreateTeacherWithRelationsResult {
  success: boolean
  teacherId?: string
  userId?: string
  warnings: string[]
}

export interface TeacherPositionUpdatePayload {
  hireDate?: string
  isPrimary?: boolean
}

export interface TeacherEditData {
  id?: string
  nip?: string | null
  nuptk?: string | null
  employmentTypeId?: string
  employmentType?: EmploymentTypeOption
  teacherPositions?: TeacherPosition[]
  user?: {
    profile?: {
      name?: string
      nik?: string | null
      gender?: string
      birthPlace?: string
      birthDate?: string
      email?: string | null
      phone?: string | null
    }
  }
}

export interface PositionOption {
  id: string
  name: string
}

export interface PositionEditData {
  id?: string
  positionId?: string
  hireDate?: string
  isPrimary?: boolean
  position?: { id: string; name?: string }
}

export interface PositionCategoryRef {
  id: string
  code: string
  name: string
}

export interface PositionListItem {
  id: string
  name: string
  category: PositionCategoryRef
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

export interface TeacherColumnActions {
  onView?: (teacher: Teacher) => void
  onEdit?: (teacher: Teacher) => void
  onViewDetail?: (teacher: Teacher) => void
  onDelete?: (
    teacher: Teacher,
    callbacks: { closeAlert: () => void; setLoading: (s: boolean) => void },
  ) => Promise<void>
  showActions?: boolean
  /** Per-action gates — hide edit/delete when the user lacks that permission. */
  canUpdate?: boolean
  canDelete?: boolean
}
