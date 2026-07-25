export interface SemesterType {
  id: string
  name: string
  isActive: boolean
}

export interface SemesterTypeCreatePayload {
  name: string
  isActive: boolean
}

export interface SemesterTypeUpdatePayload {
  name?: string
  isActive?: boolean
}

export interface SemesterTypeQuery {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
}
