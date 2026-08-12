import api from '@/shared/utils/api'
import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'
import type {
  BulkGeneratePayload,
  BulkGenerateResult,
  GenerateRaporPayload,
  RaporData,
  RaporDetailData,
  RaporQueryParams,
  UpdateRaporPayload,
} from '../types'

export const raporApi = {
  getRapors: (params?: RaporQueryParams) => {
    return api.get<ApiPaginatedResponse<RaporData>>('/rapors', { params })
  },
  getRaporById: (id: string) => {
    return api.get<RaporData>(`/rapors/${id}`)
  },
  getRaporDetail: (id: string) => {
    return api.get<RaporDetailData>(`/rapors/${id}/detail`)
  },
  generateRapor: (payload: GenerateRaporPayload) => {
    return api.post<RaporData>('/rapors/generate', payload)
  },
  bulkGenerateRapor: (payload: BulkGeneratePayload) => {
    return api.post<ApiSingleResponse<BulkGenerateResult>>(
      '/rapors/generate/bulk',
      payload,
    )
  },
  updateRapor: (id: string, payload: UpdateRaporPayload) => {
    return api.patch<RaporData>(`/rapors/${id}`, payload)
  },
  publishRapor: (id: string) => {
    return api.patch<RaporData>(`/rapors/${id}/publish`)
  },
  deleteRapor: (id: string) => {
    return api.delete(`/rapors/${id}`)
  },
  exportReportCard: (id: string) => {
    return api.get(`/rapors/${id}/export`, { responseType: 'blob' })
  },
}
