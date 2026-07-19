export interface Religion {
  id: string
  name: string
  isActive: boolean
}

export interface ReligionCreatePayload {
  name: string
  isActive?: boolean
}

export interface ReligionUpdatePayload {
  name?: string
  isActive?: boolean
}

export interface ReligionQuery {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
}

export interface ReligionColumnActions {
  showActions?: boolean
  onEdit?: (item: Religion) => void
  onDelete?: (
    item: Religion,
    callbacks: {
      closeAlert: () => void
      setLoading: (state: boolean) => void
    },
  ) => void
}
