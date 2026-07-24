import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'
import api from '@/shared/utils/api'
import type { AchievementSavePayload, Achievement } from '../types'

export const achievementApi = {
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
