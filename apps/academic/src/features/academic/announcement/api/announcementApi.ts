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
  /**
   * The noticeboard as it is addressed to the caller.
   *
   * School-wide notices plus their own class's, resolved from their enrolment.
   * No classroom is passed — the audience is theirs to be told, not to choose.
   */
  getMyAnnouncements: (params?: AnnouncementQueryParams) => {
    return api.get<ApiPaginatedResponse<Announcement>>('/announcements/me', {
      params,
    })
  },

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
