import type { EducationStatus } from './educational-history'

export interface EducationalHistoryEditData {
  id?: string
  level?: string
  institution?: string
  major?: string | null
  startYear?: number
  endYear?: number | null
  status?: string
}

export interface EducationalHistoryCreatePayload {
  profileId: string
  level: string
  institution: string
  major?: string | null
  startYear: number
  endYear?: number | null
  status?: EducationStatus
}

export interface EducationalHistoryUpdatePayload {
  level?: string
  institution?: string
  major?: string | null
  startYear?: number
  endYear?: number | null
  status?: EducationStatus
}
