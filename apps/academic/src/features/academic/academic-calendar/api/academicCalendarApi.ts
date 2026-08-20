import api from '@/shared/utils/api'
import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'
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

  getCalendarById: (id: string) => {
    // The envelope, not the entity: every response is wrapped in
    // `{ statusCode, message, data }` by the API's interceptor, so the caller
    // reads `res.data.data`. Typing it as the entity compiles and then hands
    // back an object whose every field is undefined.
    return api.get<ApiSingleResponse<CalendarEventData>>(
      `/academic-calendars/${id}`,
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
