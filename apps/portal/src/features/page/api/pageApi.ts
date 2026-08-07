import api from '@/shared/utils/api'
import type { ApiSingleResponse } from '@/shared/types/api'
import type {
  CreateNavItemPayload,
  CreatePagePayload,
  NavItem,
  PortalPage,
  PublicNavItem,
  PublicPage,
  UpdateNavItemPayload,
  UpdatePagePayload,
} from '../types'

/** HTTP only — no business logic, no store access (Principle I). */
export const pageApi = {
  list: () => api.get<ApiSingleResponse<PortalPage[]>>('/portal/pages'),

  getById: (id: string) =>
    api.get<ApiSingleResponse<PortalPage>>(`/portal/pages/${id}`),

  create: (payload: CreatePagePayload) =>
    api.post<ApiSingleResponse<PortalPage>>('/portal/pages', payload),

  update: (id: string, payload: UpdatePagePayload) =>
    api.patch<ApiSingleResponse<PortalPage>>(`/portal/pages/${id}`, payload),

  publish: (id: string, version: number) =>
    api.post<ApiSingleResponse<PortalPage>>(`/portal/pages/${id}/publish`, {
      version,
    }),

  unpublish: (id: string, version: number) =>
    api.post<ApiSingleResponse<PortalPage>>(`/portal/pages/${id}/unpublish`, {
      version,
    }),

  remove: (id: string) => api.delete<void>(`/portal/pages/${id}`),

  getPublic: (slug: string) =>
    api.get<ApiSingleResponse<PublicPage>>(`/portal/public/pages/${slug}`),
}

export const navigationApi = {
  list: () => api.get<ApiSingleResponse<NavItem[]>>('/portal/navigation'),

  listPublic: () =>
    api.get<ApiSingleResponse<PublicNavItem[]>>('/portal/public/navigation'),

  create: (payload: CreateNavItemPayload) =>
    api.post<ApiSingleResponse<NavItem>>('/portal/navigation', payload),

  update: (id: string, payload: UpdateNavItemPayload) =>
    api.patch<ApiSingleResponse<NavItem>>(`/portal/navigation/${id}`, payload),

  reorder: (itemIds: string[]) =>
    api.patch<void>('/portal/navigation/order', { itemIds }),

  remove: (id: string) => api.delete<void>(`/portal/navigation/${id}`),
}
