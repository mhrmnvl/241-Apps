export interface AcademicCalendarType {
  id: string
  name: string
  isActive: boolean
}

export interface AcademicCalendarTypeCreatePayload {
  name: string
  isActive?: boolean
}

export interface AcademicCalendarTypeUpdatePayload {
  name?: string
  isActive?: boolean
}

export interface AcademicCalendarTypeQuery {
  page?: number
  limit?: number
  search?: string
  isActive?: boolean
}
