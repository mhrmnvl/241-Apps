export interface AudienceGroupOption {
  id: string
  code: string
  name: string
}

export interface EventAudienceItem {
  id: string
  audienceGroup: AudienceGroupOption
}

export interface EventData {
  id: string
  title: string
  description?: string
  audiences: EventAudienceItem[]
  startTime: string
  endTime: string
  classroomIds?: string[]
}

export interface EventCreatePayload {
  title: string
  description: string
  audienceGroupIds?: string[]
  startTime: string
  endTime: string
  classroomIds?: string[]
}

export interface EventUpdatePayload {
  title?: string
  description?: string
  audienceGroupIds?: string[]
  startTime?: string
  endTime?: string
  classroomIds?: string[]
}

export interface EventQueryParams {
  page?: number
  limit?: number
  classroomId?: string
  audienceGroupId?: string
  search?: string
}

export interface DateClickInfo {
  dateStr: string
}

export interface EventClickExtendedProps {
  description?: string
  audiences?: EventAudienceItem[]
  startTime?: string
  endTime?: string
  classroomIds?: string[]
}

export interface EventClickInfo {
  event: {
    id: string
    title: string
    extendedProps: EventClickExtendedProps
  }
}

export interface EventCalendarRange {
  start: string
  end: string
}

export interface EventFilterPayload {
  classroomId?: string
  audienceGroupId?: string
}

export interface EventColumnActions {
  onEdit: (eventObj: EventData) => void
  onDelete: (
    eventObj: EventData,
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
  startTime: string
  endTime: string
  isEvent?: boolean
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
