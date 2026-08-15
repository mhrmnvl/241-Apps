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

  /**
   * The caller's own marks, across their enrolments. No student parameter
   * exists — a score belongs to whoever signed in, and the server says which.
   */
  getMyScores: (params?: {
    semesterId?: string
    enrollmentId?: string
    limit?: number
  }) => {
    // `enrollmentId` narrows to one term's marks. It cannot widen: the server
    // applies the caller's own student after the query, so naming a
    // classmate's enrolment returns nothing rather than theirs.
    return api.get<ApiPaginatedResponse<StudentScoreItem>>(
      '/student-scores/me',
      { params },
    )
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
