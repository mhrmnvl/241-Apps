import type { ApiSingleResponse } from '@/shared/types/api'
import api from '@/shared/utils/api'
import type { AcademicSetting, AcademicSettingSavePayload } from '../types'

/**
 * One settings record for the whole school, so both routes are unaddressed —
 * there is nothing to identify.
 */
export const academicSettingApi = {
  getAcademicSetting: () => {
    return api.get<ApiSingleResponse<AcademicSetting>>('/academic-settings')
  },

  updateAcademicSetting: (payload: AcademicSettingSavePayload) => {
    return api.patch<ApiSingleResponse<AcademicSetting>>(
      '/academic-settings',
      payload,
    )
  },
}
