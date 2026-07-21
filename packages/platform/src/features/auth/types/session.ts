export interface AuthProfile {
  id?: string
  name?: string | null
  email?: string | null
  avatar?: string | null
}

export interface AuthUser {
  id: string
  identifier: string
  isActive: boolean
  roles: string[]
  permissions: string[]
  organizationId?: string | null
  schoolUnitId?: string | null
  name?: string | null
  profile?: AuthProfile | null
  student?: {
    id?: string
    classroomId?: string
    name?: string | null
    nisn?: string | null
    nis?: string | null
  } | null
  teacher?: {
    id: string
    name?: string | null
    nip?: string | null
  } | null
}
