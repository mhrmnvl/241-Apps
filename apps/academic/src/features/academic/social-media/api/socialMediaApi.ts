import api from '@/shared/utils/api'
import type {
  SocialMedia,
  SocialMediaCreatePayload,
  SocialMediaUpdatePayload,
  SocialMediaQuery,
} from '../types'
import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'

export const socialMediaApi = {
  getSocialMedias: (params?: SocialMediaQuery) => {
    return api.get<ApiPaginatedResponse<SocialMedia>>('/social-medias', {
      params,
    })
  },
  createSocialMedia: (payload: SocialMediaCreatePayload) => {
    return api.post<ApiSingleResponse<SocialMedia>>('/social-medias', payload)
  },
  updateSocialMedia: (id: string, payload: SocialMediaUpdatePayload) => {
    return api.patch<ApiSingleResponse<SocialMedia>>(
      `/social-medias/${id}`,
      payload,
    )
  },
  deleteSocialMedia: (id: string) => {
    return api.delete(`/social-medias/${id}`)
  },
  /**
   * One request per row, because the backend has no bulk route.
   *
   * This called `POST /social-medias/bulk-delete` until 2026-08-15, which no
   * controller has ever served — the button answered "Gagal menghapus beberapa
   * socialMedia" every time. `allSettled` rather than `all` so one refusal does
   * not hide the rows that were deleted, and the caller is told how many.
   */
  deleteBulkSocialMedias: async (ids: string[]) => {
    const results = await Promise.allSettled(
      ids.map((id) => api.delete(`/social-medias/${id}`)),
    )
    return {
      deleted: results.filter((r) => r.status === 'fulfilled').length,
      failed: results.filter((r) => r.status === 'rejected').length,
    }
  },
}
