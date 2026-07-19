export interface OccupationCreatePayload {
  name: string
  isActive?: boolean
}

export interface OccupationUpdatePayload {
  name?: string
  isActive?: boolean
}

export interface OccupationQuery {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
}
