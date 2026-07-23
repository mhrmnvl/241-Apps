import type {
  ApiSingleResponse,
  ApiPaginatedResponse,
} from '@/shared/types/api'
import api from '@/shared/utils/api'
import type {
  StudentScoreRosterResponse,
  BulkUpsertStudentScorePayload,
  StudentScoreItem,
} from '../types'

export const studentScoreApi = {
  getScores: (params: { enrollmentId?: string; limit?: number }) => {
    return api.get<ApiPaginatedResponse<StudentScoreItem>>('/student-scores', {
      params,
    })
  },

  getRoster: (assessmentItemId: string) => {
    return api.get<ApiSingleResponse<StudentScoreRosterResponse>>(
      '/student-scores/roster',
      { params: { assessmentItemId } },
    )
  },

  bulkUpsertScores: (payload: BulkUpsertStudentScorePayload) => {
    return api.post<ApiSingleResponse<{ saved: number }>>(
      '/student-scores/bulk',
      payload,
    )
  },
}
