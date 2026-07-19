import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'
import api from '@/shared/utils/api'
import type {
  AssessmentItemQueryParams,
  AssessmentItemSavePayload,
  AssessmentItem,
} from '../types'

export const assessmentItemApi = {
  getAssessmentItems: (params?: AssessmentItemQueryParams) => {
    return api.get<ApiPaginatedResponse<AssessmentItem>>('/assessment-items', {
      params,
    })
  },

  createAssessmentItem: (payload: AssessmentItemSavePayload) => {
    return api.post<ApiSingleResponse<AssessmentItem>>(
      '/assessment-items',
      payload,
    )
  },

  updateAssessmentItem: (
    id: string,
    payload: Partial<AssessmentItemSavePayload>,
  ) => {
    return api.patch<ApiSingleResponse<AssessmentItem>>(
      `/assessment-items/${id}`,
      payload,
    )
  },

  deleteAssessmentItem: (id: string) => {
    return api.delete(`/assessment-items/${id}`)
  },
}
