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

/**
 * What FullCalendar hands back when an entry is clicked.
 *
 * Whatever `AcademicCalendarGridView` spreads into an event and FullCalendar
 * does not recognise ends up here, so this mirrors `CalendarEventData` — and
 * has to keep mirroring it. A field present at runtime but missing here is
 * reachable only by casting through `Record<string, unknown>`, which is how
 * `startTime` and `endTime` were being read.
 */
export interface EventClickExtendedProps {
  description?: string
  type?: { id: string; name: string } | null
  startDate?: string
  endDate?: string
  /** Clock hours, when the entry has any — see `CalendarEventData`. */
  startTime?: string | null
  endTime?: string | null
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
