import api from '@/shared/utils/api'
import type { ApiSingleResponse } from '@/shared/types/api'
import type {
  CategoryCreatePayload,
  CategoryUpdatePayload,
  PostCategory,
  PostTag,
  PublicPostCategory,
  TagCreatePayload,
  TagUpdatePayload,
} from '../types'

/** HTTP only — no business logic, no store access (Principle I). */
export const categoryApi = {
  list: () => api.get<ApiSingleResponse<PostCategory[]>>('/portal/categories'),

  listPublic: () =>
    api.get<ApiSingleResponse<PublicPostCategory[]>>(
      '/portal/public/categories',
    ),

  create: (payload: CategoryCreatePayload) =>
    api.post<ApiSingleResponse<PostCategory>>('/portal/categories', payload),

  update: (id: string, payload: CategoryUpdatePayload) =>
    api.patch<ApiSingleResponse<PostCategory>>(
      `/portal/categories/${id}`,
      payload,
    ),

  remove: (id: string) => api.delete<void>(`/portal/categories/${id}`),
}

export const tagApi = {
  list: (search?: string) =>
    api.get<ApiSingleResponse<PostTag[]>>('/portal/tags', {
      params: search ? { search } : undefined,
    }),

  listPublic: () =>
    api.get<ApiSingleResponse<PostTag[]>>('/portal/public/tags'),

  create: (payload: TagCreatePayload) =>
    api.post<ApiSingleResponse<PostTag>>('/portal/tags', payload),

  update: (id: string, payload: TagUpdatePayload) =>
    api.patch<ApiSingleResponse<PostTag>>(`/portal/tags/${id}`, payload),

  remove: (id: string) => api.delete<void>(`/portal/tags/${id}`),
}
