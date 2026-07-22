import type { ApiSingleResponse } from '@/shared/types/api'
import api from '@/shared/utils/api'
import type {
  StudentScoreRosterResponse,
  BulkUpsertStudentScorePayload,
} from '../types'

export const studentScoreApi = {
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
