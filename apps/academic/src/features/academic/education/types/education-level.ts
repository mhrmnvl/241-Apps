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
