import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'
import type {
  EducationLevel,
  EducationLevelCreatePayload,
  EducationLevelUpdatePayload,
  EducationLevelQuery,
} from '../types'
import api from '@/shared/utils/api'

export const educationApi = {
  getEducationLevels: (params?: EducationLevelQuery) => {
    return api.get<ApiPaginatedResponse<EducationLevel>>('/education-levels', {
      params,
    })
  },

  getEducationLevel: (id: string) => {
    return api.get<ApiSingleResponse<EducationLevel>>(`/education-levels/${id}`)
  },

  createEducationLevel: (payload: EducationLevelCreatePayload) => {
    return api.post<ApiSingleResponse<EducationLevel>>(
      '/education-levels',
      payload,
    )
  },

  updateEducationLevel: (id: string, payload: EducationLevelUpdatePayload) => {
    return api.patch<ApiSingleResponse<EducationLevel>>(
      `/education-levels/${id}`,
      payload,
    )
  },

  deleteEducationLevel: (id: string) => {
    return api.delete(`/education-levels/${id}`)
  },
}
