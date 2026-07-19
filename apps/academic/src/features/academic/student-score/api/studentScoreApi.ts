import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'
import api from '@/shared/utils/api'
import type {
  StudentScoreQueryParams,
  StudentScoreSavePayload,
  BulkStudentScorePayload,
  StudentScore,
} from '../types'

export const studentScoreApi = {
  getScores: (params?: StudentScoreQueryParams) => {
    return api.get<ApiPaginatedResponse<StudentScore>>('/student-scores', {
      params,
    })
  },

  createScore: (payload: StudentScoreSavePayload) => {
    return api.post<ApiSingleResponse<StudentScore>>('/student-scores', payload)
  },

  updateScore: (id: string, payload: Partial<StudentScoreSavePayload>) => {
    return api.patch<ApiSingleResponse<StudentScore>>(
      `/student-scores/${id}`,
      payload,
    )
  },

  bulkSaveScores: (payload: BulkStudentScorePayload) => {
    return api.post<ApiSingleResponse<StudentScore>>(
      '/student-scores/bulk',
      payload,
    )
  },
}
