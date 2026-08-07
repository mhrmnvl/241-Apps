import api from '@/shared/utils/api'
import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'
import type {
  AddPhotoPayload,
  CreateAlbumPayload,
  GalleryAlbum,
  GalleryPhoto,
  PublicAlbumDetail,
  PublicAlbumSummary,
  UpdateAlbumPayload,
  UpdatePhotoPayload,
} from '../types'

/** HTTP only — no business logic, no store access (Principle I). */
export const galleryApi = {
  list: (params: { page?: number; search?: string }) =>
    api.get<ApiPaginatedResponse<GalleryAlbum>>('/portal/albums', { params }),

  getById: (id: string) =>
    api.get<ApiSingleResponse<GalleryAlbum>>(`/portal/albums/${id}`),

  create: (payload: CreateAlbumPayload) =>
    api.post<ApiSingleResponse<GalleryAlbum>>('/portal/albums', payload),

  update: (id: string, payload: UpdateAlbumPayload) =>
    api.patch<ApiSingleResponse<GalleryAlbum>>(`/portal/albums/${id}`, payload),

  addPhoto: (id: string, payload: AddPhotoPayload) =>
    api.post<ApiSingleResponse<GalleryPhoto>>(
      `/portal/albums/${id}/photos`,
      payload,
    ),

  reorderPhotos: (id: string, photoIds: string[]) =>
    api.patch<void>(`/portal/albums/${id}/photos/order`, { photoIds }),

  updatePhoto: (id: string, photoId: string, payload: UpdatePhotoPayload) =>
    api.patch<ApiSingleResponse<GalleryPhoto>>(
      `/portal/albums/${id}/photos/${photoId}`,
      payload,
    ),

  removePhoto: (id: string, photoId: string) =>
    api.delete<void>(`/portal/albums/${id}/photos/${photoId}`),

  publish: (id: string, version: number) =>
    api.post<ApiSingleResponse<GalleryAlbum>>(`/portal/albums/${id}/publish`, {
      version,
    }),

  unpublish: (id: string, version: number) =>
    api.post<ApiSingleResponse<GalleryAlbum>>(
      `/portal/albums/${id}/unpublish`,
      { version },
    ),

  remove: (id: string) => api.delete<void>(`/portal/albums/${id}`),
}

export const publicGalleryApi = {
  list: (params: { page?: number; limit?: number }) =>
    api.get<ApiPaginatedResponse<PublicAlbumSummary>>('/portal/public/albums', {
      params,
    }),

  getBySlug: (slug: string, params: { page?: number; limit?: number }) =>
    api.get<ApiSingleResponse<PublicAlbumDetail>>(
      `/portal/public/albums/${slug}`,
      { params },
    ),
}
