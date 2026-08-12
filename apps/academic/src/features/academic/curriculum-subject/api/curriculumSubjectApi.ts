import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'
import api from '@/shared/utils/api'
import type {
  CurriculumSubject,
  CurriculumSubjectQueryParams,
  CurriculumSubjectSavePayload,
} from '../types'

export interface BulkCreateCurriculumSubjectPayload {
  curriculumId: string
  subjectId: string
  hoursPerWeek?: number
}

export interface BulkCreateResult {
  created: number
  skipped: number
}

export const curriculumSubjectApi = {
  getCurriculumSubjects: (params?: CurriculumSubjectQueryParams) => {
    return api.get<ApiPaginatedResponse<CurriculumSubject>>(
      '/curriculum-subjects',
      { params },
    )
  },

  createCurriculumSubject: (payload: CurriculumSubjectSavePayload) => {
    return api.post<ApiSingleResponse<CurriculumSubject>>(
      '/curriculum-subjects',
      payload,
    )
  },

  bulkCreateCurriculumSubjects: (
    items: BulkCreateCurriculumSubjectPayload[],
  ) => {
    // Enveloped like every other response: the global interceptor wraps the
    // body in `{ statusCode, message, data }`, so the counts sit one level in.
    return api.post<ApiSingleResponse<BulkCreateResult>>(
      '/curriculum-subjects/bulk',
      { items },
    )
  },

  updateCurriculumSubject: (
    id: string,
    payload: Partial<CurriculumSubjectSavePayload>,
  ) => {
    return api.patch<ApiSingleResponse<CurriculumSubject>>(
      `/curriculum-subjects/${id}`,
      payload,
    )
  },

  deleteCurriculumSubject: (id: string) => {
    return api.delete(`/curriculum-subjects/${id}`)
  },
}
