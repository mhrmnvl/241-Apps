import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'
import type {
  SemesterType,
  SemesterTypeCreatePayload,
  SemesterTypeQuery,
  SemesterTypeUpdatePayload,
} from '../types'
import api from '@/shared/utils/api'

export const semesterTypeApi = {
  getSemesterTypes: (params?: SemesterTypeQuery) => {
    return api.get<ApiPaginatedResponse<SemesterType>>('/semester-types', {
      params,
    })
  },

  getSemesterTypeById: (id: string) => {
    return api.get<ApiSingleResponse<SemesterType>>(`/semester-types/${id}`)
  },

  createSemesterType: (payload: SemesterTypeCreatePayload) => {
    return api.post<ApiSingleResponse<SemesterType>>('/semester-types', payload)
  },

  updateSemesterType: (id: string, payload: SemesterTypeUpdatePayload) => {
    return api.patch<ApiSingleResponse<SemesterType>>(
      `/semester-types/${id}`,
      payload,
    )
  },

  deleteSemesterType: (id: string) => {
    return api.delete<void>(`/semester-types/${id}`)
  },
}
