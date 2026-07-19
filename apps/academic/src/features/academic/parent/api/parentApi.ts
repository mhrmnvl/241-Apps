import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'
import api from '@/shared/utils/api'
import type { Parent, ParentQueryParams, ParentSavePayload } from '../types'

export const parentApi = {
  getParents: (params?: ParentQueryParams) => {
    return api.get<ApiPaginatedResponse<Parent>>('/parents', { params })
  },

  getParentById: (id: string) => {
    return api.get<ApiSingleResponse<Parent>>(`/parents/${id}`)
  },

  createParent: (payload: ParentSavePayload) => {
    return api.post<ApiSingleResponse<Parent>>('/parents', payload)
  },

  updateParent: (id: string, payload: Partial<ParentSavePayload>) => {
    return api.patch<ApiSingleResponse<Parent>>(`/parents/${id}`, payload)
  },

  deleteParent: (id: string) => {
    return api.delete(`/parents/${id}`)
  },
}
