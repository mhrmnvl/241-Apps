import type { ApiSingleResponse } from '@/shared/types/api'
import type { SchoolUnitAddress, SchoolUnitProfile } from '../types'
import api from '@/shared/utils/api'

export const schoolUnitApi = {
  getSchoolUnit: () => {
    return api.get<ApiSingleResponse<SchoolUnitProfile>>('/school-units')
  },

  createSchoolUnit: (payload: Partial<SchoolUnitProfile>) => {
    return api.post<ApiSingleResponse<SchoolUnitProfile>>(
      '/school-units',
      payload,
    )
  },

  updateSchoolUnit: (payload: Partial<SchoolUnitProfile>) => {
    return api.patch<ApiSingleResponse<SchoolUnitProfile>>(
      '/school-units',
      payload,
    )
  },

  getSchoolUnitAddress: () => {
    return api.get<ApiSingleResponse<SchoolUnitAddress>>(
      '/school-unit-addresses',
    )
  },

  createSchoolUnitAddress: (payload: Partial<SchoolUnitAddress>) => {
    return api.post<ApiSingleResponse<SchoolUnitAddress>>(
      '/school-unit-addresses',
      payload,
    )
  },

  updateSchoolUnitAddress: (payload: Partial<SchoolUnitAddress>) => {
    return api.patch<ApiSingleResponse<SchoolUnitAddress>>(
      '/school-unit-addresses',
      payload,
    )
  },
}
