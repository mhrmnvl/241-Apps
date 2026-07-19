export interface CalendarCreatePayload {
  academicYearId: string
  semesterId?: string
  title: string
  typeId: string
  startDate: string
  endDate: string
  description?: string
}

export interface CalendarUpdatePayload {
  semesterId?: string
  title?: string
  typeId?: string
  startDate?: string
  endDate?: string
  description?: string
}

export interface CalendarSavePayload {
  title: string
  description?: string
  typeId: string
  startDate: string
  endDate: string
  academicYearId?: string
  semesterId?: string
}
