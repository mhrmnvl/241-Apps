export interface BloodType {
  id: string
  name: string
  isActive: boolean
}

export interface BloodTypeCreatePayload {
  name: string
  isActive?: boolean
}

export interface BloodTypeUpdatePayload {
  name?: string
  isActive?: boolean
}

export interface BloodTypeQuery {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
}

export interface BloodTypeColumnActions {
  showActions?: boolean
  onEdit?: (item: BloodType) => void
  onDelete?: (
    item: BloodType,
    callbacks: {
      closeAlert: () => void
      setLoading: (state: boolean) => void
    },
  ) => void
}
