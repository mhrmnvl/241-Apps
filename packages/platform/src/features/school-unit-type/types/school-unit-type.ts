export interface SchoolUnitType {
  id: string
  code: string
  name: string
  isActive: boolean
}

export interface SchoolUnitTypeCreatePayload {
  code: string
  name: string
  isActive?: boolean
}

export interface SchoolUnitTypeUpdatePayload {
  name: string
  isActive?: boolean
}

export interface SchoolUnitTypeQuery {
  page?: number
  limit?: number
  search?: string
}
