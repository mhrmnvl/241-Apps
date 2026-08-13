import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'
import api from '@/shared/utils/api'
import type {
  AchievementSavePayload,
  Achievement,
  AchievementQueryParams,
} from '../types'

export const achievementApi = {
  /**
   * Every achievement in the school, for the standalone list.
   *
   * The same endpoint as `getAchievements`, without pinning it to one person:
   * `profileId` is optional on the backend query, and the response carries the
   * profile it belongs to — which is what makes a school-wide table readable.
   */
  getAllAchievements: (params: AchievementQueryParams) => {
    return api.get<ApiPaginatedResponse<Achievement>>('/achievements', {
      params,
    })
  },

  getAchievements: (profileId: string, limit = 50) => {
    return api.get<ApiPaginatedResponse<Achievement>>('/achievements', {
      params: { profileId, limit },
    })
  },

  createAchievement: (payload: AchievementSavePayload) => {
    return api.post<ApiSingleResponse<Achievement>>('/achievements', payload)
  },

  updateAchievement: (
    id: string,
    payload: Omit<AchievementSavePayload, 'profileId'>,
  ) => {
    return api.patch<ApiSingleResponse<Achievement>>(
      `/achievements/${id}`,
      payload,
    )
  },

  deleteAchievement: (id: string) => {
    return api.delete(`/achievements/${id}`)
  },
}
