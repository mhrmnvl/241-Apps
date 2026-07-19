import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'
import api from '@/shared/utils/api'
import type {
  SchoolUnitType,
  SchoolUnitTypeCreatePayload,
  SchoolUnitTypeQuery,
  SchoolUnitTypeUpdatePayload,
} from '../types'

export const schoolUnitTypeApi = {
  getSchoolUnitTypes: (params?: SchoolUnitTypeQuery) => {
    return api.get<ApiPaginatedResponse<SchoolUnitType>>('/school-unit-types', {
      params,
    })
  },

  getSchoolUnitType: (id: string) => {
    return api.get<ApiSingleResponse<SchoolUnitType>>(
      `/school-unit-types/${id}`,
    )
  },

  createSchoolUnitType: (payload: SchoolUnitTypeCreatePayload) => {
    return api.post<ApiSingleResponse<SchoolUnitType>>(
      '/school-unit-types',
      payload,
    )
  },

  updateSchoolUnitType: (id: string, payload: SchoolUnitTypeUpdatePayload) => {
    return api.patch<ApiSingleResponse<SchoolUnitType>>(
      `/school-unit-types/${id}`,
      payload,
    )
  },

  deleteSchoolUnitType: (id: string) => {
    return api.delete(`/school-unit-types/${id}`)
  },
}
