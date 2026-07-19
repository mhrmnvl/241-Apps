import api from '@/shared/utils/api'
import type {
  SocialMedia,
  SocialMediaCreatePayload,
  SocialMediaUpdatePayload,
  SocialMediaQuery,
} from '../types'
import type { ApiPaginatedResponse } from '@/shared/types/api'

export const socialMediaApi = {
  getSocialMedias: (params?: SocialMediaQuery) => {
    return api.get<ApiPaginatedResponse<SocialMedia>>('/social-medias', {
      params,
    })
  },
  createSocialMedia: (payload: SocialMediaCreatePayload) => {
    return api.post<SocialMedia>('/social-medias', payload)
  },
  updateSocialMedia: (id: string, payload: SocialMediaUpdatePayload) => {
    return api.patch<SocialMedia>(`/social-medias/${id}`, payload)
  },
  deleteSocialMedia: (id: string) => {
    return api.delete(`/social-medias/${id}`)
  },
  deleteBulkSocialMedias: (ids: string[]) => {
    return api.post('/social-medias/bulk-delete', { ids })
  },
}
