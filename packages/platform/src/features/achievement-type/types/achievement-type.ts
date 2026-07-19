export interface AchievementType {
  id: string
  name: string
  isActive: boolean
}

export interface AchievementTypeCreatePayload {
  name: string
  isActive?: boolean
}

export interface AchievementTypeUpdatePayload {
  name?: string
  isActive?: boolean
}

export interface AchievementTypeQuery {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
}

export interface AchievementTypeColumnActions {
  showActions?: boolean
  onEdit?: (item: AchievementType) => void
  onDelete?: (
    item: AchievementType,
    callbacks: {
      closeAlert: () => void
      setLoading: (state: boolean) => void
    },
  ) => void
}
