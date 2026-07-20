import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'
import api from '@/shared/utils/api'
import type { GradeAcademicYear, AssignCurriculumPayload } from '../types'

export const gradeAcademicYearApi = {
  getAssignments: (academicYearId?: string) =>
    api.get<ApiPaginatedResponse<GradeAcademicYear>>('/grade-academic-years', {
      params: academicYearId ? { academicYearId } : {},
    }),

  assign: (payload: AssignCurriculumPayload) =>
    api.post<ApiSingleResponse<GradeAcademicYear>>(
      '/grade-academic-years',
      payload,
    ),

  remove: (id: string) => api.delete(`/grade-academic-years/${id}`),
}
