export interface CalendarCreatePayload {
  academicYearId: string
  semesterId?: string
  title: string
  typeId: string
  startDate: string
  endDate: string
  /** Optional clock hours, `'08:00'`. Both or neither. */
  startTime?: string
  endTime?: string
  description?: string
}

export interface CalendarUpdatePayload {
  semesterId?: string
  title?: string
  typeId?: string
  startDate?: string
  endDate?: string
  startTime?: string
  endTime?: string
  description?: string
}

export interface CalendarSavePayload {
  title: string
  description?: string
  typeId: string
  startDate: string
  endDate: string
  /** Optional clock hours, `'08:00'`. Both or neither. */
  startTime?: string
  endTime?: string
  academicYearId?: string
  semesterId?: string
}
