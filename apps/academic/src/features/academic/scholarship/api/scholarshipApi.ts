import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'
import api from '@/shared/utils/api'
import type {
  ScholarshipCreatePayload,
  ScholarshipUpdatePayload,
  Scholarship,
} from '../types'

export const scholarshipApi = {
  getScholarships: (userId: string, limit = 50) => {
    return api.get<ApiPaginatedResponse<Scholarship>>('/scholarships', {
      params: { userId, limit },
    })
  },
  createScholarship: (payload: ScholarshipCreatePayload) => {
    return api.post<ApiSingleResponse<Scholarship>>('/scholarships', payload)
  },
  updateScholarship: (id: string, payload: ScholarshipUpdatePayload) => {
    return api.patch<ApiSingleResponse<Scholarship>>(
      `/scholarships/${id}`,
      payload,
    )
  },
  deleteScholarship: (id: string) => {
    return api.delete(`/scholarships/${id}`)
  },
}
