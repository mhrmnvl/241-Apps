import api from '@/shared/utils/api'
import type { ApiSingleResponse } from '@/shared/types/api'
import type {
  HomepageResponse,
  HomepageSectionSetting,
  UpdateHomepageSectionPayload,
} from '../types'

export const homepageApi = {
  /** Anonymous. One round trip for every section the homepage renders. */
  getPublic: () =>
    api.get<ApiSingleResponse<HomepageResponse>>('/portal/public/homepage'),

  getSections: () =>
    api.get<ApiSingleResponse<HomepageSectionSetting[]>>(
      '/portal/homepage/sections',
    ),

  updateSection: (key: string, payload: UpdateHomepageSectionPayload) =>
    api.patch<ApiSingleResponse<HomepageSectionSetting>>(
      `/portal/homepage/sections/${key}`,
      payload,
    ),
}
