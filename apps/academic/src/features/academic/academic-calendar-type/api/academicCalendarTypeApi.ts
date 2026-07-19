import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'
import type {
  AcademicCalendarType,
  AcademicCalendarTypeCreatePayload,
  AcademicCalendarTypeUpdatePayload,
  AcademicCalendarTypeQuery,
} from '../types'
import api from '@/shared/utils/api'

export const academicCalendarTypeApi = {
  getAcademicCalendarTypes: (params?: AcademicCalendarTypeQuery) => {
    return api.get<ApiPaginatedResponse<AcademicCalendarType>>(
      '/academic-calendar-types',
      {
        params,
      },
    )
  },

  getAcademicCalendarType: (id: string) => {
    return api.get<ApiSingleResponse<AcademicCalendarType>>(
      `/academic-calendar-types/${id}`,
    )
  },

  createAcademicCalendarType: (payload: AcademicCalendarTypeCreatePayload) => {
    return api.post<ApiSingleResponse<AcademicCalendarType>>(
      '/academic-calendar-types',
      payload,
    )
  },

  updateAcademicCalendarType: (
    id: string,
    payload: AcademicCalendarTypeUpdatePayload,
  ) => {
    return api.patch<ApiSingleResponse<AcademicCalendarType>>(
      `/academic-calendar-types/${id}`,
      payload,
    )
  },

  deleteAcademicCalendarType: (id: string) => {
    return api.delete(`/academic-calendar-types/${id}`)
  },
}
