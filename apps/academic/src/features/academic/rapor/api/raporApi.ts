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
  RaporListMeta,
  RaporQueryParams,
  UpdateRaporPayload,
} from '../types'

export const raporApi = {
  getRapors: (params?: RaporQueryParams) => {
    return api.get<ApiPaginatedResponse<RaporData, RaporListMeta>>('/rapors', {
      params,
    })
  },
  /**
   * The caller's own published report cards. No student parameter exists —
   * the server resolves whose these are from the signed-in account.
   */
  getMine: (params?: RaporQueryParams) => {
    return api.get<ApiPaginatedResponse<RaporData, RaporListMeta>>(
      '/rapors/me',
      { params },
    )
  },

  getRaporById: (id: string) => {
    return api.get<ApiSingleResponse<RaporData>>(`/rapors/${id}`)
  },
  /**
   * One card in full, with its attendance.
   *
   * Two routes, not one with a flag: `report-cards.read` opens anybody's,
   * `report-cards.read-own` opens only the caller's, and the backend settles
   * ownership rather than trusting the id this screen sends. Both paths 404'd
   * until 2026-08-15 — the frontend had asked for `/detail` since the first
   * commit and no such route was ever written, so the dialog opened empty
   * behind an error toast on both views.
   */
  getRaporDetail: (id: string) => {
    return api.get<ApiSingleResponse<RaporDetailData>>(`/rapors/${id}/detail`)
  },
  getMyRaporDetail: (id: string) => {
    return api.get<ApiSingleResponse<RaporDetailData>>(
      `/rapors/me/${id}/detail`,
    )
  },
  generateRapor: (payload: GenerateRaporPayload) => {
    return api.post<ApiSingleResponse<RaporData>>('/rapors/generate', payload)
  },
  bulkGenerateRapor: (payload: BulkGeneratePayload) => {
    return api.post<ApiSingleResponse<BulkGenerateResult>>(
      '/rapors/generate/bulk',
      payload,
    )
  },
  updateRapor: (id: string, payload: UpdateRaporPayload) => {
    return api.patch<ApiSingleResponse<RaporData>>(`/rapors/${id}`, payload)
  },
  publishRapor: (id: string) => {
    return api.patch<ApiSingleResponse<RaporData>>(`/rapors/${id}/publish`)
  },
  deleteRapor: (id: string) => {
    return api.delete(`/rapors/${id}`)
  },
  exportReportCard: (id: string) => {
    return api.get(`/rapors/${id}/export`, { responseType: 'blob' })
  },
}
