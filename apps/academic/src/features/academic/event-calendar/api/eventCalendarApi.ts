import api from '@/shared/utils/api'
import type {
  EventData,
  EventCreatePayload,
  EventUpdatePayload,
  EventQueryParams,
} from '../types'
import type { ApiPaginatedResponse } from '@/shared/types/api'

export const eventCalendarApi = {
  getEvents: (params?: EventQueryParams) => {
    return api.get<ApiPaginatedResponse<EventData>>('/events', { params })
  },

  createEvent: (payload: EventCreatePayload) => {
    return api.post<EventData>('/events', payload)
  },

  updateEvent: (id: string, payload: EventUpdatePayload) => {
    return api.patch<EventData>(`/events/${id}`, payload)
  },

  deleteEvent: (id: string) => {
    return api.delete(`/events/${id}`)
  },

  deleteBulkEvents: (ids: string[]) => {
    return api.delete('/events/bulk', { data: { ids } })
  },
}
