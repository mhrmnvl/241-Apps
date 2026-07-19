import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'
import api from '@/shared/utils/api'
import type {
  TeachingAssignment,
  TeachingAssignmentQueryParams,
  TeachingAssignmentSavePayload,
} from '../types'

export const teachingAssignmentApi = {
  getTeachingAssignments: (params?: TeachingAssignmentQueryParams) => {
    return api.get<ApiPaginatedResponse<TeachingAssignment>>(
      '/teaching-assignments',
      { params },
    )
  },

  createTeachingAssignment: (payload: TeachingAssignmentSavePayload) => {
    return api.post<ApiSingleResponse<TeachingAssignment>>(
      '/teaching-assignments',
      payload,
    )
  },

  updateTeachingAssignment: (
    id: string,
    payload: Partial<TeachingAssignmentSavePayload>,
  ) => {
    return api.patch<ApiSingleResponse<TeachingAssignment>>(
      `/teaching-assignments/${id}`,
      payload,
    )
  },

  deleteTeachingAssignment: (id: string) => {
    return api.delete(`/teaching-assignments/${id}`)
  },
}
