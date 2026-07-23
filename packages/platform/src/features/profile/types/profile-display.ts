import type { UserGender, MaritalStatus, IncomeRange } from './profile-enums'
import type { TeacherRecord, StudentRecord, AddressRecord } from './profile'

export interface SchoolIdentity {
  employmentStatus?: string | null
  primaryPosition?: string | null
  additionalDuties?: string | null
  positionCategory?: string | null
  classCategory?: string | null
  hireDate?: string | null
  taughtSubjects?: string | null
  className?: string | null
  gradeLevel?: string | null
  supervisorName?: string | null
}

export interface ProfileDisplayData {
  fullName?: string
  nik?: string
  birthPlace?: string
  birthDate?: string
  gender?: UserGender | null
  religion?: string | null
  bloodType?: string | null
  maritalStatus?: MaritalStatus | null
  email?: string | null
  phone?: string | null
  kk?: string | null
  npwp?: string | null
  schoolIdentity?: SchoolIdentity
  parents?: ParentDisplayData[]
  educationHistory?: any[]
  studentHistory?: any[]
  achievements?: any[]
  scholarships?: any[]
  positions?: any[]
}

export interface SchoolProfileData {
  roles?: string[]
  nis?: string | null
  nisn?: string | null
  nip?: string | null
  nuptk?: string | null
  schoolIdentity?: SchoolIdentity
}

export interface ParentDisplayData {
  type?: string
  name?: string
  nik?: string
  birthPlace?: string
  birthDate?: string
  phone?: string
  email?: string
  education?: string
  occupation?: string
  income?: IncomeRange | null
}

export interface ProfileParentsData {
  parents?: ParentDisplayData[]
}

export interface AddressData {
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

export interface ProfileStoreData {
  roles?: string[]
  nik?: string
  nip?: string | null
  nuptk?: string | null
  nis?: string | null
  nisn?: string | null
  fullName?: string
  birthPlace?: string
  birthDate?: string
  gender?: UserGender | null
  email?: string | null
  phone?: string | null
  bloodType?: string | null
  religion?: string | null
  maritalStatus?: MaritalStatus | null
  kk?: string | null
  npwp?: string | null
  avatar?: string | null
  schoolIdentity?: SchoolIdentity
  address?: AddressData | null
  parents?: ParentDisplayData[]
  educationHistory?: any[]
  studentHistory?: any[]
  achievements?: any[]
  scholarships?: any[]
  positions?: any[]
}

export interface RawProfileData {
  userId?: string
  id?: string
  roles?: string[]
  nik?: string
  name?: string
  gender?: UserGender
  birthPlace?: string
  birthDate?: string
  email?: string | null
  phone?: string | null
  religionId?: string | null
  bloodTypeId?: string | null
  religion?: { id: string; name: string } | null
  bloodType?: { id: string; name: string } | null
  maritalStatus?: MaritalStatus | null
  noKk?: string | null
  npwp?: string | null
  avatar?: string | null
  teacher?: TeacherRecord | null
  student?: StudentRecord | null
  address?: AddressRecord | null
}
