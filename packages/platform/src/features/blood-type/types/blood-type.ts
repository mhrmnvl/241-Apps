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
