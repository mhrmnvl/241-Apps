import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'
import api from '@/shared/utils/api'
import type {
  BulkGraduationPayload,
  BulkGraduationResult,
  GraduationCandidateList,
  StudentGraduation,
  StudentGraduationQueryParams,
  StudentGraduationSavePayload,
} from '../types'

export const studentGraduationApi = {
  getStudentGraduations: (params?: StudentGraduationQueryParams) => {
    return api.get<ApiPaginatedResponse<StudentGraduation>>(
      '/student-graduations',
      { params },
    )
  },

  getStudentGraduationById: (id: string) => {
    return api.get<ApiSingleResponse<StudentGraduation>>(
      `/student-graduations/${id}`,
    )
  },

  createStudentGraduation: (payload: StudentGraduationSavePayload) => {
    return api.post<ApiSingleResponse<StudentGraduation>>(
      '/student-graduations',
      payload,
    )
  },

  updateStudentGraduation: (
    id: string,
    payload: Partial<StudentGraduationSavePayload>,
  ) => {
    return api.patch<ApiSingleResponse<StudentGraduation>>(
      `/student-graduations/${id}`,
      payload,
    )
  },

  deleteStudentGraduation: (id: string) => {
    return api.delete(`/student-graduations/${id}`)
  },

  getCandidates: () => {
    return api.get<ApiSingleResponse<GraduationCandidateList>>(
      '/student-graduations/candidates',
    )
  },

  bulkGraduate: (payload: BulkGraduationPayload) => {
    return api.post<ApiSingleResponse<BulkGraduationResult>>(
      '/student-graduations/bulk',
      payload,
    )
  },
}
