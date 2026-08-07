import api from '@/shared/utils/api'
import type { ApiSingleResponse } from '@/shared/types/api'
import type { MediaLibraryItem, MediaUsage } from '../types'

/** HTTP only — no business logic, no store access (Principle I). */
export const mediaApi = {
  library: () =>
    api.get<ApiSingleResponse<MediaLibraryItem[]>>('/portal/media'),

  usage: (fileId: string) =>
    api.get<ApiSingleResponse<MediaUsage>>(`/portal/media/${fileId}/usage`),

  /**
   * Uploads go through the platform endpoint rather than a portal-specific one.
   * It already caps size at 10 MB, validates by magic bytes rather than the
   * client-supplied type, and optimizes images — a second path would be a
   * second, weaker validator (FR-056).
   */
  upload: (file: File) => {
    const form = new FormData()
    form.append('file', file)
    return api.post<ApiSingleResponse<{ id: string; url: string }>>(
      '/files/upload?appKey=PORTAL',
      form,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
  },
}
