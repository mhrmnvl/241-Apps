import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'
import api from '@/shared/utils/api'
import type {
  Position,
  PositionQueryParams,
  PositionSavePayload,
} from '../types'

export const positionApi = {
  getPositions: (params?: PositionQueryParams) => {
    return api.get<ApiPaginatedResponse<Position>>('/positions', { params })
  },

  createPosition: (payload: PositionSavePayload) => {
    return api.post<ApiSingleResponse<Position>>('/positions', payload)
  },

  updatePosition: (id: string, payload: Partial<PositionSavePayload>) => {
    return api.patch<ApiSingleResponse<Position>>(`/positions/${id}`, payload)
  },

  deletePosition: (id: string) => {
    return api.delete(`/positions/${id}`)
  },
}
