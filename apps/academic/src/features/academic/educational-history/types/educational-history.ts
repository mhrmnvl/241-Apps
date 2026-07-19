export type EducationStatus = 'GRADUATED' | 'ACTIVE' | 'TRANSFERRED' | 'DROPPED'

export const EDUCATION_STATUSES = [
  { value: 'GRADUATED', label: 'Lulus' },
  { value: 'ACTIVE', label: 'Aktif / Masih Berjalan' },
  { value: 'TRANSFERRED', label: 'Pindahan' },
  { value: 'DROPPED', label: 'Keluar' },
] as const

export function getEducationStatusLabel(status: string): string {
  return EDUCATION_STATUSES.find((s) => s.value === status)?.label ?? status
}

export interface EducationalHistory {
  id: string
  profileId: string
  level: string
  institution: string
  major?: string | null
  startYear: number
  endYear?: number | null
  status: EducationStatus
  deletedAt?: string | null
}
