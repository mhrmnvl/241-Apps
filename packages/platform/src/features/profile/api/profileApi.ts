import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'
import type {
  ProfileApiResponse,
  SocialMediaPayload,
  SocialMediaUpdatePayload,
  ProfileUpdatePayload,
  SocialMediaRecord,
} from '../types'
import api from '@/shared/utils/api'

export const profileApi = {
  getProfileByUserId: (userId: string) => {
    return api.get<ApiSingleResponse<ProfileApiResponse>>(`/profiles/${userId}`)
  },

  getMyProfile: () => {
    return api.get<ApiSingleResponse<ProfileApiResponse>>('/profiles/me')
  },

  updateMyProfile: (payload: ProfileUpdatePayload) => {
    return api.patch<ApiSingleResponse<ProfileApiResponse>>(
      '/profiles/me',
      payload,
    )
  },

  updateProfileByUserId: (userId: string, payload: ProfileUpdatePayload) => {
    return api.patch<ApiSingleResponse<ProfileApiResponse>>(
      `/profiles/${userId}`,
      payload,
    )
  },

  getAllSocialMedias: (params: {
    page?: number
    limit?: number
    search?: string
    role?: string
  }) => {
    return api.get<ApiPaginatedResponse<SocialMediaRecord>>(
      '/profiles/social-media-links/all',
      { params },
    )
  },

  deleteSocialMedia: (userId: string, id: string) => {
    return api.delete(`/profiles/${userId}/social-media-links/${id}`)
  },

  addSocialMedia: (userId: string, payload: SocialMediaPayload) => {
    return api.post<ApiSingleResponse<SocialMediaRecord>>(
      `/profiles/${userId}/social-media-links`,
      payload,
    )
  },

  updateSocialMedia: (
    userId: string,
    socialMediaId: string,
    payload: SocialMediaUpdatePayload,
  ) => {
    return api.patch<ApiSingleResponse<SocialMediaRecord>>(
      `/profiles/${userId}/social-media-links/${socialMediaId}`,
      payload,
    )
  },
}
