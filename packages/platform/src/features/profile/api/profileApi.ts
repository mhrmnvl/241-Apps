import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'
import type {
  ProfileApiResponse,
  ProfileRecord,
  SocialMediaPayload,
  SocialMediaUpdatePayload,
  ProfileUpdatePayload,
  SocialMediaRecord,
} from '../types'
import api from '@/shared/utils/api'
import { authConfig } from '../../auth/config'

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

  uploadMyPhoto: (file: File) => {
    const formData = new FormData()
    formData.append('file', file)
    // appKey tags which app the upload came from, purely for how the
    // backend organizes its storage bucket — see fileApi.ts for the same
    // pattern already used by the generic file upload endpoint.
    return api.post<ApiSingleResponse<ProfileRecord>>(
      '/profiles/me/photo',
      formData,
      { params: { appKey: authConfig.value.appKey } },
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
