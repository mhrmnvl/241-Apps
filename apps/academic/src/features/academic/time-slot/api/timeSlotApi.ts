import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'
import api from '@/shared/utils/api'
import type {
  TimeSlotQueryParams,
  TimeSlotSavePayload,
  TimeSlot,
} from '../types'

export const timeSlotApi = {
  getTimeSlots: (params?: TimeSlotQueryParams) => {
    return api.get<ApiPaginatedResponse<TimeSlot>>('/time-slots', { params })
  },

  createTimeSlot: (payload: TimeSlotSavePayload) => {
    return api.post<ApiSingleResponse<TimeSlot>>('/time-slots', payload)
  },

  updateTimeSlot: (id: string, payload: TimeSlotSavePayload) => {
    return api.patch<ApiSingleResponse<TimeSlot>>(`/time-slots/${id}`, payload)
  },

  deleteTimeSlot: (id: string) => {
    return api.delete(`/time-slots/${id}`)
  },
}
