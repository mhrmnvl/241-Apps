import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'
import type {
  BloodType,
  BloodTypeCreatePayload,
  BloodTypeUpdatePayload,
  BloodTypeQuery,
} from '../types'
import api from '@/shared/utils/api'

export const bloodTypeApi = {
  getBloodTypes: (params?: BloodTypeQuery) => {
    return api.get<ApiPaginatedResponse<BloodType>>('/blood-types', {
      params,
    })
  },

  getBloodType: (id: string) => {
    return api.get<ApiSingleResponse<BloodType>>(`/blood-types/${id}`)
  },

  createBloodType: (payload: BloodTypeCreatePayload) => {
    return api.post<ApiSingleResponse<BloodType>>('/blood-types', payload)
  },

  updateBloodType: (id: string, payload: BloodTypeUpdatePayload) => {
    return api.patch<ApiSingleResponse<BloodType>>(
      `/blood-types/${id}`,
      payload,
    )
  },

  deleteBloodType: (id: string) => {
    return api.delete(`/blood-types/${id}`)
  },
}
