import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'
import api from '@/shared/utils/api'
import type {
  EducationalHistoryCreatePayload,
  EducationalHistoryUpdatePayload,
  EducationalHistory,
} from '../types'

export const educationalHistoryApi = {
  getEducationalHistories: (userId: string, limit = 50) => {
    return api.get<ApiPaginatedResponse<EducationalHistory>>(
      '/educational-histories',
      { params: { userId, limit } },
    )
  },
  createEducationalHistory: (payload: EducationalHistoryCreatePayload) => {
    return api.post<ApiSingleResponse<EducationalHistory>>(
      '/educational-histories',
      payload,
    )
  },
  updateEducationalHistory: (
    id: string,
    payload: EducationalHistoryUpdatePayload,
  ) => {
    return api.patch<ApiSingleResponse<EducationalHistory>>(
      `/educational-histories/${id}`,
      payload,
    )
  },
  deleteEducationalHistory: (id: string) => {
    return api.delete(`/educational-histories/${id}`)
  },
}
