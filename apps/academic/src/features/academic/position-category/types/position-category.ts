export interface PositionCategory {
  id: string
  code: string
  name: string
}

export interface PositionCategoryCreatePayload {
  code: string
  name: string
}

export interface PositionCategoryUpdatePayload {
  name: string
}

export interface PositionCategoryQuery {
  page?: number
  limit?: number
  search?: string
}

export interface PositionCategoryColumnActions {
  showActions?: boolean
  onEdit?: (item: PositionCategory) => void
  onDelete?: (
    item: PositionCategory,
    callbacks: {
      closeAlert: () => void
      setLoading: (state: boolean) => void
    },
  ) => void
}
