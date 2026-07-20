export type IncomeRange =
  | 'BELOW_500K'
  | 'BETWEEN_500K_1M'
  | 'BETWEEN_1M_2M'
  | 'BETWEEN_2M_3M'
  | 'ABOVE_3M'

export interface ParentOccupation {
  id: string
  name: string
}

export interface Parent {
  id: string
  name: string
  nik: string
  birthPlace: string
  birthDate: string
  email?: string | null
  phone?: string | null
  occupationId: string
  educationId?: string | null
  income?: IncomeRange | null
  occupation?: ParentOccupation
  _count?: {
    addresses: number
    studentParents: number
  }
}

export interface ParentSavePayload {
  name: string
  nik: string
  birthPlace: string
  birthDate: string
  email?: string
  phone?: string
  occupationId: string
  income?: IncomeRange
}

export interface ParentQueryParams {
  page?: number
  limit?: number
  search?: string
  occupationId?: string
}

export interface ParentColumnActions {
  onEdit?: (item: Parent) => void
  onDelete?: (
    item: Parent,
    callbacks: { closeAlert: () => void; setLoading: (s: boolean) => void },
  ) => Promise<void>
  showActions?: boolean
}

export const INCOME_RANGE_LABELS: Record<IncomeRange, string> = {
  BELOW_500K: '< Rp 500.000',
  BETWEEN_500K_1M: 'Rp 500.000 - 1.000.000',
  BETWEEN_1M_2M: 'Rp 1.000.000 - 2.000.000',
  BETWEEN_2M_3M: 'Rp 2.000.000 - 3.000.000',
  ABOVE_3M: '> Rp 3.000.000',
}

export const getIncomeRangeLabel = (income?: IncomeRange | null) => {
  if (!income) return '-'
  return INCOME_RANGE_LABELS[income] ?? income
}
