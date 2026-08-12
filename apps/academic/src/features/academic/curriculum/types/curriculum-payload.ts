export interface CurriculumEditData {
  academicYearId?: string
  name?: string
  isActive?: boolean
}

export interface CurriculumSavePayload {
  academicYearId: string
  name: string
  isActive: boolean
}

export interface CurriculumQueryParams {
  page?: number
  limit?: number
  search?: string
  academicYearId?: string
  isActive?: boolean
}
