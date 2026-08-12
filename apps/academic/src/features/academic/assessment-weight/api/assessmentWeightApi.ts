import type { ApiSingleResponse } from '@/shared/types/api'
import api from '@/shared/utils/api'
import type {
  AssessmentWeight,
  ReplaceAssessmentWeightsPayload,
} from '../types'

export const assessmentWeightApi = {
  getWeights: (teachingAssignmentId: string) => {
    return api.get<ApiSingleResponse<AssessmentWeight[]>>(
      '/assessment-weights',
      { params: { teachingAssignmentId } },
    )
  },

  /** Replaces the whole set; the server rejects anything that is not 100. */
  replaceWeights: (payload: ReplaceAssessmentWeightsPayload) => {
    return api.put<ApiSingleResponse<AssessmentWeight[]>>(
      '/assessment-weights',
      payload,
    )
  },
}
