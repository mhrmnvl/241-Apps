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

export interface AcademicCalendarTypeColumnActions {
  showActions?: boolean
  onEdit?: (item: AcademicCalendarType) => void
  onDelete?: (
    item: AcademicCalendarType,
    callbacks: {
      closeAlert: () => void
      setLoading: (state: boolean) => void
    },
  ) => void
}
