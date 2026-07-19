export interface ClassroomLevelSavePayload {
  level: number
  name: string
  isActive?: boolean
}

export interface ClassroomLevelQueryParams {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
}
