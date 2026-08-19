import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'
import api from '@/shared/utils/api'
import type {
  TeachingAssignment,
  TeachingAssignmentCreatePayload,
  TeachingAssignmentCreateResult,
  TeachingAssignmentQueryParams,
  TeachingAssignmentUpdatePayload,
} from '../types'

export const teachingAssignmentApi = {
  getTeachingAssignments: (params?: TeachingAssignmentQueryParams) => {
    return api.get<ApiPaginatedResponse<TeachingAssignment>>(
      '/teaching-assignments',
      { params },
    )
  },

  /**
   * The classes the signed-in teacher is assigned to.
   *
   * The server applies their teacher record after the query, so a `teacherId`
   * sent from here cannot widen it — naming a colleague returns nothing rather
   * than their classes.
   */
  getMyTeachingAssignments: (params?: TeachingAssignmentQueryParams) => {
    return api.get<ApiPaginatedResponse<TeachingAssignment>>(
      '/teaching-assignments/me',
      { params },
    )
  },

  createTeachingAssignment: (payload: TeachingAssignmentCreatePayload) => {
    return api.post<ApiSingleResponse<TeachingAssignmentCreateResult>>(
      '/teaching-assignments',
      payload,
    )
  },

  updateTeachingAssignment: (
    id: string,
    payload: Partial<TeachingAssignmentUpdatePayload>,
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
