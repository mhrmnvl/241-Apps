import type { CalendarEventData } from './academic-calendar'

export interface CalendarQueryParams {
  page?: number
  limit?: number
  academicYearId?: string
  semesterId?: string
  typeId?: string
}

export interface DateClickInfo {
  dateStr: string
}

export interface EventClickExtendedProps {
  description?: string
  type?: { id: string; name: string } | null
  startDate?: string
  endDate?: string
  academicYearId?: string
}

export interface EventClickInfo {
  event: {
    id: string
    title: string
    extendedProps: EventClickExtendedProps
  }
}

export interface CalendarRange {
  start: string
  end: string
}

export interface FilterPayload {
  type: string
}

export interface CalendarColumnActions {
  onEdit: (eventObj: CalendarEventData) => void
  onDelete: (
    eventObj: CalendarEventData,
    callbacks: {
      setLoading: (loading: boolean) => void
      closeAlert: () => void
    },
  ) => void
  showActions?: boolean
}

export interface BaseCalendarEvent {
  id: string
  title: string
  startDate: string
  endDate: string
}

export type MappedCalendarEvent = BaseCalendarEvent & {
  start: string
  end: string
  allDay: boolean
  display: string
  backgroundColor: string
  borderColor: string
  textColor: string
  classNames: string[]
}
