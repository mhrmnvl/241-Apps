import type { ApiSingleResponse } from '@/shared/types/api'
import api from '@/shared/utils/api'
import type {
  AppKey,
  AppSetting,
  UpdateAppSettingPayload,
} from '../types/app-setting.types'

export const settingsApi = {
  getSettings: (appKey: AppKey) => {
    return api.get<ApiSingleResponse<AppSetting>>(`/settings/${appKey}`)
  },

  updateSettings: (appKey: AppKey, payload: UpdateAppSettingPayload) => {
    return api.patch<ApiSingleResponse<AppSetting>>(
      `/settings/${appKey}`,
      payload,
    )
  },

  uploadLogo: (appKey: AppKey, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<ApiSingleResponse<AppSetting>>(
      `/settings/${appKey}/logo`,
      formData,
    )
  },

  uploadFavicon: (appKey: AppKey, file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    return api.post<ApiSingleResponse<AppSetting>>(
      `/settings/${appKey}/favicon`,
      formData,
    )
  },
}
