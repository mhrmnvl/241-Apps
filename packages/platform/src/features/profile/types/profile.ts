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

export interface AchievementRecord {
  id?: string
  name?: string
  level?: string
  year?: number
  description?: string | null
  type?: { id?: string; name?: string; code?: string }
}

export interface ScholarshipRecord {
  id?: string
  name?: string
  provider?: string
  year?: number
  status?: 'ACTIVE' | 'COMPLETED' | 'REVOKED'
}

export interface EducationalHistoryRecord {
  id?: string
  level?: string
  institution?: string
  major?: string | null
  startYear?: number
  endYear?: number | null
  status?: 'GRADUATED' | 'ACTIVE' | 'TRANSFERRED' | 'DROPPED'
}

export interface TeacherPositionRecord {
  id?: string
  teacherId?: string
  positionId?: string
  hireDate?: string
  isPrimary?: boolean
  position?: {
    id?: string
    name?: string
    category?: { id?: string; code?: string; name?: string }
  }
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
  avatar?: string | null
  socialMedias?: {
    id?: string
    platform?: { name?: string; baseUrl?: string }
    username?: string
  }[]
  achievements?: AchievementRecord[]
  scholarships?: ScholarshipRecord[]
  educationalHistories?: EducationalHistoryRecord[]
}

export interface TeacherRecord {
  id?: string
  nip?: string
  nuptk?: string
  userId?: string
  employmentStatus?: string
  employmentType?: { id: string; code: string; name: string }
  addresses?: AddressRecord[]
  teacherPositions?: TeacherPositionRecord[]
  teachingAssignments?: SubjectAssignment[]
  user?: { role?: string }
}

export interface StudentRecord {
  id?: string
  nis?: string
  nisn?: string
  userId?: string
  addresses?: AddressRecord[]
  enrollments?: {
    id?: string
    semesterId?: string
    classroom?: {
      id?: string
      code?: string
      name?: string
      grade?: { id?: string; level?: number; name?: string } | null
      classroomSupervisors?: {
        semesterId?: string
        teacher?: {
          user?: {
            profile?: {
              name?: string
            } | null
          } | null
        } | null
      }[]
    } | null
  }[]
  parents?: ParentRecord[]
}

export interface SocialMediaRecord {
  id: string
  platform: { name: string; baseUrl: string }
  username: string
  user?: { id: string; profile: { name: string } }
}
