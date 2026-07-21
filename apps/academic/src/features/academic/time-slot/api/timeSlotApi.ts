import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'
import api from '@/shared/utils/api'
import type {
  TimeSlotQueryParams,
  TimeSlotSavePayload,
  TimeSlotTypeSavePayload,
  TimeSlot,
  TimeSlotType,
} from '../types'

export const timeSlotApi = {
  getTimeSlots: (params?: TimeSlotQueryParams) => {
    return api.get<ApiPaginatedResponse<TimeSlot>>('/time-slots', { params })
  },

  getTimeSlotTypes: () => {
    return api.get<ApiPaginatedResponse<TimeSlotType>>('/time-slots/types')
  },

  createTimeSlotType: (payload: TimeSlotTypeSavePayload) => {
    return api.post<ApiSingleResponse<TimeSlotType>>(
      '/time-slots/types',
      payload,
    )
  },

  updateTimeSlotType: (id: string, payload: TimeSlotTypeSavePayload) => {
    return api.patch<ApiSingleResponse<TimeSlotType>>(
      `/time-slots/types/${id}`,
      payload,
    )
  },

  deleteTimeSlotType: (id: string) => {
    return api.delete(`/time-slots/types/${id}`)
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
