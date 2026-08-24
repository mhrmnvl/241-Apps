import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'
import type {
  GenerateRecommendationPayload,
  PromotionPayload,
  PromotionPreviewResponse,
  PromotionRecommendationResponse,
  PromotionResult,
  RolloverSemesterPayload,
  RolloverSummary,
  Semester,
  SemesterQueryParams,
  SemesterSavePayload,
} from '../types'
import api from '@/shared/utils/api'

export const semesterApi = {
  getSemesters: (params?: SemesterQueryParams) => {
    return api.get<ApiPaginatedResponse<Semester>>('/semesters', { params })
  },

  getSemesterById: (id: string) => {
    return api.get<ApiSingleResponse<Semester>>(`/semesters/${id}`)
  },

  createSemester: (payload: SemesterSavePayload) => {
    return api.post<ApiSingleResponse<Semester>>('/semesters', payload)
  },

  updateSemester: (id: string, payload: SemesterSavePayload) => {
    return api.patch<ApiSingleResponse<Semester>>(`/semesters/${id}`, payload)
  },

  deleteSemester: (id: string) => {
    return api.delete(`/semesters/${id}`)
  },

  rolloverSemester: (payload: RolloverSemesterPayload) => {
    return api.post<ApiSingleResponse<RolloverSummary>>(
      '/semesters/rollover',
      payload,
    )
  },

  activateSemester: (id: string) => {
    return api.patch<ApiSingleResponse<Semester>>(`/semesters/${id}/activate`)
  },

  deactivateSemester: (id: string) => {
    return api.patch<ApiSingleResponse<Semester>>(`/semesters/${id}/deactivate`)
  },

  /**
   * Enveloped like everything else.
   *
   * These three used to type the body as the payload itself, so `res.data` was
   * read as the answer when it was the `{ statusCode, message, data }` wrapper
   * the global interceptor puts around every response. Nothing complained: the
   * type said the field was there, so the compiler agreed and the value was
   * `undefined` only at runtime.
   */
  getPromotionRecommendation: (payload: GenerateRecommendationPayload) => {
    return api.post<ApiSingleResponse<PromotionRecommendationResponse>>(
      '/semesters/promote/recommend',
      payload,
    )
  },

  previewPromotion: (payload: PromotionPayload) => {
    return api.post<ApiSingleResponse<PromotionPreviewResponse>>(
      '/semesters/promote/preview',
      payload,
    )
  },

  executePromotion: (payload: PromotionPayload) => {
    return api.post<ApiSingleResponse<PromotionResult>>(
      '/semesters/promote',
      payload,
    )
  },
}
