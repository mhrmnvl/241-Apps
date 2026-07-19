export type ScholarshipStatus = 'ACTIVE' | 'COMPLETED' | 'REVOKED'

export const SCHOLARSHIP_STATUSES = [
  { value: 'ACTIVE', label: 'Aktif' },
  { value: 'COMPLETED', label: 'Selesai' },
  { value: 'REVOKED', label: 'Dicabut' },
] as const

export function getScholarshipStatusLabel(status: string): string {
  return SCHOLARSHIP_STATUSES.find((s) => s.value === status)?.label ?? status
}

export interface Scholarship {
  id: string
  profileId: string
  name: string
  provider: string
  year: number
  status: ScholarshipStatus
  deletedAt?: string | null
}

export interface ScholarshipEditData {
  id?: string
  name?: string
  provider?: string
  year?: number
  status?: string
}

export interface ScholarshipCreatePayload {
  profileId: string
  name: string
  provider: string
  year: number
  status?: ScholarshipStatus
}

export interface ScholarshipUpdatePayload {
  name?: string
  provider?: string
  year?: number
  status?: ScholarshipStatus
}

export interface ScholarshipTabData {
  scholarships?: Scholarship[]
}

export interface ScholarshipColumnActions {
  onEdit: (item: Scholarship) => void
  onDelete: (
    id: string,
    setLoading: (v: boolean) => void,
    closeAlert: () => void,
  ) => void
}
