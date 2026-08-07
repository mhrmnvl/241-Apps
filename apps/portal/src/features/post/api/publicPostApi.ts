import api from '@/shared/utils/api'
import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'
import type { PostDetail, PostSummary, PublicPostQuery } from '../types'

/**
 * Anonymous reads. No auth header is required and none is sent — these must
 * work for a signed-out visitor, and stay reachable while SIAKAD is down.
 */
export const publicPostApi = {
  list: (params: PublicPostQuery) =>
    api.get<ApiPaginatedResponse<PostSummary>>('/portal/public/posts', {
      params,
    }),

  getBySlug: (type: string, slug: string) =>
    api.get<ApiSingleResponse<PostDetail>>(
      `/portal/public/posts/${type}/${slug}`,
    ),

  getRelated: (type: string, slug: string) =>
    api.get<ApiSingleResponse<PostSummary[]>>(
      `/portal/public/posts/${type}/${slug}/related`,
    ),
}
