export interface EmploymentType {
  id: string
  schoolUnitId: string
  code: string
  name: string
}

export interface EmploymentTypeCreatePayload {
  code: string
  name: string
}

export interface EmploymentTypeUpdatePayload {
  name: string
}

export interface EmploymentTypeQuery {
  page?: number
  limit?: number
  search?: string
}

export interface EmploymentTypeColumnActions {
  showActions?: boolean
  onEdit?: (item: EmploymentType) => void
  onDelete?: (
    item: EmploymentType,
    callbacks: {
      closeAlert: () => void
      setLoading: (state: boolean) => void
    },
  ) => void
}
