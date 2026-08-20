export interface AcademicYearEditData {
  name?: string
  isActive?: boolean
  weeklyHolidays?: number[]
}

export interface AcademicYearSavePayload {
  name: string
  isActive?: boolean
  weeklyHolidays?: number[]
}
