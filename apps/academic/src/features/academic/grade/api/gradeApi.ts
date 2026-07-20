import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'
import api from '@/shared/utils/api'
import type { Grade, GradeQueryParams, GradeSavePayload } from '../types'

export const gradeApi = {
  getGrades: (params?: GradeQueryParams) =>
    api.get<ApiPaginatedResponse<Grade>>('/grades', {
      params,
    }),

  getGrade: (id: string) => api.get<ApiSingleResponse<Grade>>(`/grades/${id}`),

  createGrade: (payload: GradeSavePayload) =>
    api.post<ApiSingleResponse<Grade>>('/grades', payload),

  updateGrade: (id: string, payload: GradeSavePayload) =>
    api.patch<ApiSingleResponse<Grade>>(`/grades/${id}`, payload),

  deleteGrade: (id: string) => api.delete(`/grades/${id}`),
}
