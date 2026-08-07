import type { ContentStatus } from '@/features/post'

export interface GalleryPhoto {
  id: string
  albumId: string
  fileId: string
  imageUrl: string
  caption: string | null
  altText: string
  displayOrder: number
}

export interface GalleryAlbum {
  id: string
  title: string
  slug: string
  description: string | null
  eventDate: string
  coverFileId: string | null
  coverImageUrl: string | null
  status: ContentStatus
  publishedAt: string | null
  version: number
  photoCount?: number
  photos?: GalleryPhoto[]
}

export interface PublicAlbumSummary {
  id: string
  title: string
  slug: string
  description: string | null
  eventDate: string
  coverImageUrl: string | null
  photoCount: number
  publishedAt: string
}

export interface PublicPhoto {
  id: string
  imageUrl: string
  caption: string | null
  altText: string
  displayOrder: number
}

export interface PublicAlbumDetail extends PublicAlbumSummary {
  photos: {
    data: PublicPhoto[]
    meta: { page: number; limit: number; total: number; totalPages: number }
  }
}

export interface CreateAlbumPayload {
  title: string
  slug?: string
  description?: string
  eventDate: string
  coverFileId?: string
}

export type UpdateAlbumPayload = Partial<CreateAlbumPayload> & {
  version: number
}

export interface AddPhotoPayload {
  fileId: string
  altText: string
  caption?: string
}

/** Caption and alt text are the only editable parts of a photo — the file
 *  itself is replaced by removing and re-adding. */
export interface UpdatePhotoPayload {
  caption?: string | null
  altText?: string
}
