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
