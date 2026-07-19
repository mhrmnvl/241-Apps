import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'
import api from '@/shared/utils/api'
import type {
  CurriculaQueryParams,
  CurriculaSavePayload,
  Curricula,
} from '../types'

export const curriculaApi = {
  getCurricula: (params?: CurriculaQueryParams) => {
    return api.get<ApiPaginatedResponse<Curricula>>('/curricula', { params })
  },

  getCurriculumById: (id: string) => {
    return api.get<ApiSingleResponse<Curricula>>(`/curricula/${id}`)
  },

  createCurriculum: (payload: CurriculaSavePayload) => {
    return api.post<ApiSingleResponse<Curricula>>('/curricula', payload)
  },

  updateCurriculum: (id: string, payload: CurriculaSavePayload) => {
    return api.patch<ApiSingleResponse<Curricula>>(`/curricula/${id}`, payload)
  },

  deleteCurriculum: (id: string) => {
    return api.delete(`/curricula/${id}`)
  },
}
