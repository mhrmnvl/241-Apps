import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'
import api from '@/shared/utils/api'
import type {
  AcademicYearSavePayload,
  AcademicYearQueryParams,
  AcademicYear,
} from '../types'

export const academicYearApi = {
  getAcademicYears: (params?: AcademicYearQueryParams) => {
    return api.get<ApiPaginatedResponse<AcademicYear>>('/academic-years', {
      params,
    })
  },

  getAcademicYearById: (id: string) => {
    return api.get<ApiSingleResponse<AcademicYear>>(`/academic-years/${id}`)
  },

  createAcademicYear: (payload: AcademicYearSavePayload) => {
    return api.post<ApiSingleResponse<AcademicYear>>('/academic-years', payload)
  },

  updateAcademicYear: (id: string, payload: AcademicYearSavePayload) => {
    return api.patch<ApiSingleResponse<AcademicYear>>(
      `/academic-years/${id}`,
      payload,
    )
  },

  deleteAcademicYear: (id: string) => {
    return api.delete(`/academic-years/${id}`)
  },

  activateAcademicYear: (id: string) => {
    return api.patch<ApiSingleResponse<AcademicYear>>(
      `/academic-years/${id}/activate`,
    )
  },

  deactivateAcademicYear: (id: string) => {
    return api.patch<ApiSingleResponse<AcademicYear>>(
      `/academic-years/${id}/deactivate`,
    )
  },
}
