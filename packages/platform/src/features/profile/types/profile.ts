import type { UserGender, MaritalStatus, IncomeRange } from './profile-enums'

export interface AddressRecord {
  id?: string
  isPrimary?: boolean
  street?: string
  rt?: string
  rw?: string
  village?: string
  district?: string
  city?: string
  province?: string
  country?: string
  postalCode?: string
}

export interface ParentRecord {
  relation: string
  parent?: {
    name?: string
    nik?: string
    birthPlace?: string
    birthDate?: string
    email?: string
    phone?: string
    education?: { name?: string }
    occupation?: { name?: string }
    income?: IncomeRange | null
    addresses?: AddressRecord[]
  }
}

export interface SubjectAssignment {
  subject?: { name: string }
}

export interface ProfileRecord {
  id?: string
  userId?: string
  nik?: string
  name?: string
  birthPlace?: string
  birthDate?: string
  gender?: UserGender
  email?: string | null
  phone?: string | null
  bloodType?: { id: string; name: string } | null
  religion?: { id: string; name: string } | null
  maritalStatus?: MaritalStatus | null
  kk?: string | null
  npwp?: string | null
  socialMedias?: {
    id?: string
    platform?: { name?: string; baseUrl?: string }
    username?: string
  }[]
  achievements?: any[]
  scholarships?: any[]
  educationalHistories?: any[]
}

export interface TeacherRecord {
  id?: string
  nip?: string
  nuptk?: string
  userId?: string
  employmentStatus?: string
  employmentType?: { id: string; code: string; name: string }
  addresses?: AddressRecord[]
  teacherPositions?: any[]
  teachingAssignments?: SubjectAssignment[]
  user?: { role?: string }
}

export interface StudentRecord {
  id?: string
  nis?: string
  nisn?: string
  userId?: string
  addresses?: AddressRecord[]
  class?: {
    name?: string
    level?: string
    supervisor?: { user?: { profile?: { name?: string } } }
  }
  parents?: ParentRecord[]
}

export interface SocialMediaRecord {
  id: string
  platform: { name: string; baseUrl: string }
  username: string
  user?: { id: string; profile: { name: string } }
}
