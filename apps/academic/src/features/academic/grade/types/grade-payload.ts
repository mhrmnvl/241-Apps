export interface GradeSavePayload {
  level: number
  name: string
  isActive?: boolean
}

export interface GradeQueryParams {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
}
