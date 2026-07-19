import api from '@/shared/utils/api'
import type {
  Occupation,
  OccupationCreatePayload,
  OccupationUpdatePayload,
  OccupationQuery,
} from '../types'
import type { ApiPaginatedResponse } from '@/shared/types/api'

export const occupationApi = {
  getOccupations: (params?: OccupationQuery) => {
    return api.get<ApiPaginatedResponse<Occupation>>('/occupations', { params })
  },
  getOccupation: (id: string) => {
    return api.get<Occupation>(`/occupations/${id}`)
  },
  createOccupation: (payload: OccupationCreatePayload) => {
    return api.post<Occupation>('/occupations', payload)
  },
  updateOccupation: (id: string, payload: OccupationUpdatePayload) => {
    return api.patch<Occupation>(`/occupations/${id}`, payload)
  },
  deleteOccupation: (id: string) => {
    return api.delete(`/occupations/${id}`)
  },
}
