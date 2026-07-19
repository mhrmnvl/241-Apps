import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'
import type {
  AchievementType,
  AchievementTypeCreatePayload,
  AchievementTypeUpdatePayload,
  AchievementTypeQuery,
} from '../types'
import api from '@/shared/utils/api'

export const achievementTypeApi = {
  getAchievementTypes: (params?: AchievementTypeQuery) => {
    return api.get<ApiPaginatedResponse<AchievementType>>(
      '/achievement-types',
      {
        params,
      },
    )
  },

  getAchievementType: (id: string) => {
    return api.get<ApiSingleResponse<AchievementType>>(
      `/achievement-types/${id}`,
    )
  },

  createAchievementType: (payload: AchievementTypeCreatePayload) => {
    return api.post<ApiSingleResponse<AchievementType>>(
      '/achievement-types',
      payload,
    )
  },

  updateAchievementType: (
    id: string,
    payload: AchievementTypeUpdatePayload,
  ) => {
    return api.patch<ApiSingleResponse<AchievementType>>(
      `/achievement-types/${id}`,
      payload,
    )
  },

  deleteAchievementType: (id: string) => {
    return api.delete(`/achievement-types/${id}`)
  },
}
