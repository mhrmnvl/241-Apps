import type { ProfileRecord, TeacherRecord, StudentRecord } from './profile'

export interface ProfileApiResponse {
  id: string
  identifier?: string
  organizationId?: string
  schoolUnitId?: string | null
  userRoles?: {
    role: {
      code: string
      name: string
      rolePermissions?: { permission: { code: string } }[]
    }
  }[]
  profile: ProfileRecord | null
  teacher: TeacherRecord | null
  student: StudentRecord | null
}

export interface AuthUser {
  id: string
  roles: readonly string[] | string[]
  student?: { id?: string; classroomId?: string } | null
  teacher?: { id?: string } | null
}
