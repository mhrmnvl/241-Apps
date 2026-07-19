export interface EducationLevel {
  id: string
  name: string
  isActive: boolean
}

export interface EducationLevelCreatePayload {
  name: string
  isActive?: boolean
}

export interface EducationLevelUpdatePayload {
  name?: string
  isActive?: boolean
}

export interface EducationLevelQuery {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
}

export interface EducationLevelColumnActions {
  showActions?: boolean
  onEdit?: (item: EducationLevel) => void
  onDelete?: (
    item: EducationLevel,
    callbacks: {
      closeAlert: () => void
      setLoading: (state: boolean) => void
    },
  ) => void
}
