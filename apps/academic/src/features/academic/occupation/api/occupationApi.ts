import api from '@/shared/utils/api'
import type {
  Occupation,
  OccupationCreatePayload,
  OccupationUpdatePayload,
  OccupationQuery,
} from '../types'
import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'

export const occupationApi = {
  getOccupations: (params?: OccupationQuery) => {
    return api.get<ApiPaginatedResponse<Occupation>>('/occupations', { params })
  },
  getOccupation: (id: string) => {
    return api.get<ApiSingleResponse<Occupation>>(`/occupations/${id}`)
  },
  createOccupation: (payload: OccupationCreatePayload) => {
    return api.post<ApiSingleResponse<Occupation>>('/occupations', payload)
  },
  updateOccupation: (id: string, payload: OccupationUpdatePayload) => {
    return api.patch<ApiSingleResponse<Occupation>>(
      `/occupations/${id}`,
      payload,
    )
  },
  deleteOccupation: (id: string) => {
    return api.delete(`/occupations/${id}`)
  },
}
