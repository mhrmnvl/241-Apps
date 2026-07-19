export interface CurriculaEditData {
  academicYearId?: string
  name?: string
  isActive?: boolean
}

export interface CurriculaSavePayload {
  academicYearId: string
  name: string
  isActive: boolean
}

export interface CurriculaQueryParams {
  page?: number
  limit?: number
  search?: string
  academicYearId?: string
  isActive?: boolean
}
