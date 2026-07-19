import api from '@/shared/utils/api'
import type { ApiPaginatedResponse } from '@/shared/types/api'
import type {
  CalendarEventData,
  CalendarQueryParams,
  CalendarCreatePayload,
  CalendarUpdatePayload,
} from '../types'

export const academicCalendarApi = {
  getCalendars: (params?: CalendarQueryParams) => {
    return api.get<ApiPaginatedResponse<CalendarEventData>>(
      '/academic-calendars',
      {
        params,
      },
    )
  },

  createCalendar: (payload: CalendarCreatePayload) => {
    return api.post<CalendarEventData>('/academic-calendars', payload)
  },

  updateCalendar: (id: string, payload: CalendarUpdatePayload) => {
    return api.patch<CalendarEventData>(`/academic-calendars/${id}`, payload)
  },

  deleteCalendar: (id: string) => {
    return api.delete(`/academic-calendars/${id}`)
  },

  deleteBulkCalendars: (ids: string[]) => {
    return api.delete('/academic-calendars/bulk', { data: { ids } })
  },
}
