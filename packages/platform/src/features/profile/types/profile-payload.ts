import type { UserGender, MaritalStatus } from './profile-enums'

export interface ProfileUpdatePayload {
  name?: string
  nik?: string
  gender?: UserGender
  birthPlace?: string
  birthDate?: string
  email?: string | null
  phone?: string | null
  religionId?: string | null
  bloodTypeId?: string | null
  maritalStatus?: MaritalStatus | null
  noKk?: string | null
  npwp?: string | null
}

export interface SocialMediaPayload {
  platformId: string
  username?: string
}

export interface SocialMediaUpdatePayload {
  platformId?: string
  username?: string
}
