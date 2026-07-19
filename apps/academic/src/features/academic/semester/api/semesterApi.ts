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

  getPromotionRecommendation: (payload: GenerateRecommendationPayload) => {
    return api.post<PromotionRecommendationResponse>(
      '/semesters/promote/recommend',
      payload,
    )
  },

  previewPromotion: (payload: PromotionPayload) => {
    return api.post<PromotionPreviewResponse>(
      '/semesters/promote/preview',
      payload,
    )
  },

  executePromotion: (payload: PromotionPayload) => {
    return api.post<PromotionResult>('/semesters/promote', payload)
  },
}
