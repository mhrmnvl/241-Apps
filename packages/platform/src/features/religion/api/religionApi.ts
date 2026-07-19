import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'
import type {
  Religion,
  ReligionCreatePayload,
  ReligionUpdatePayload,
  ReligionQuery,
} from '../types'
import api from '@/shared/utils/api'

export const religionApi = {
  getReligions: (params?: ReligionQuery) => {
    return api.get<ApiPaginatedResponse<Religion>>('/religions', {
      params,
    })
  },

  getReligion: (id: string) => {
    return api.get<ApiSingleResponse<Religion>>(`/religions/${id}`)
  },

  createReligion: (payload: ReligionCreatePayload) => {
    return api.post<ApiSingleResponse<Religion>>('/religions', payload)
  },

  updateReligion: (id: string, payload: ReligionUpdatePayload) => {
    return api.patch<ApiSingleResponse<Religion>>(`/religions/${id}`, payload)
  },

  deleteReligion: (id: string) => {
    return api.delete(`/religions/${id}`)
  },
}
