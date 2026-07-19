import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'
import api from '@/shared/utils/api'
import type {
  Announcement,
  AnnouncementQueryParams,
  AnnouncementSavePayload,
} from '../types'

export const announcementApi = {
  getAnnouncements: (params?: AnnouncementQueryParams) => {
    return api.get<ApiPaginatedResponse<Announcement>>('/announcements', {
      params,
    })
  },

  createAnnouncement: (payload: AnnouncementSavePayload) => {
    return api.post<ApiSingleResponse<Announcement>>('/announcements', payload)
  },

  updateAnnouncement: (
    id: string,
    payload: Partial<AnnouncementSavePayload>,
  ) => {
    return api.patch<ApiSingleResponse<Announcement>>(
      `/announcements/${id}`,
      payload,
    )
  },

  deleteAnnouncement: (id: string) => {
    return api.delete(`/announcements/${id}`)
  },
}
