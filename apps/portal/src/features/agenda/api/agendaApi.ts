import api from '@/shared/utils/api'
import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'
import type {
  AgendaEntry,
  CreateAgendaPayload,
  PublicAgendaEntry,
  PublicAgendaQuery,
  UpdateAgendaPayload,
} from '../types'

/** HTTP only — no business logic, no store access (Principle I). */
export const agendaApi = {
  list: (params: { page?: number; limit?: number; search?: string }) =>
    api.get<ApiPaginatedResponse<AgendaEntry>>('/portal/agenda', { params }),

  getById: (id: string) =>
    api.get<ApiSingleResponse<AgendaEntry>>(`/portal/agenda/${id}`),

  create: (payload: CreateAgendaPayload) =>
    api.post<ApiSingleResponse<AgendaEntry>>('/portal/agenda', payload),

  update: (id: string, payload: UpdateAgendaPayload) =>
    api.patch<ApiSingleResponse<AgendaEntry>>(`/portal/agenda/${id}`, payload),

  publish: (id: string, version: number, scheduledAt?: string) =>
    api.post<ApiSingleResponse<AgendaEntry>>(`/portal/agenda/${id}/publish`, {
      version,
      scheduledAt,
    }),

  unpublish: (id: string, version: number) =>
    api.post<ApiSingleResponse<AgendaEntry>>(`/portal/agenda/${id}/unpublish`, {
      version,
    }),

  remove: (id: string) => api.delete<void>(`/portal/agenda/${id}`),
}

export const publicAgendaApi = {
  list: (params: PublicAgendaQuery) =>
    api.get<ApiPaginatedResponse<PublicAgendaEntry>>('/portal/public/agenda', {
      params,
    }),

  getBySlug: (slug: string) =>
    api.get<ApiSingleResponse<PublicAgendaEntry>>(
      `/portal/public/agenda/${slug}`,
    ),
}
