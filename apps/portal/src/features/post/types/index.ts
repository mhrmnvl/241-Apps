export const POST_TYPES = ['BERITA', 'ARTIKEL', 'PENGUMUMAN'] as const
export type PostType = (typeof POST_TYPES)[number]

export const CONTENT_STATUSES = [
  'DRAFT',
  'SCHEDULED',
  'PUBLISHED',
  'ARCHIVED',
] as const
export type ContentStatus = (typeof CONTENT_STATUSES)[number]

export interface PostCategoryRef {
  id: string
  name: string
  slug: string
}

export interface PostTagRef {
  id: string
  name: string
  slug: string
}

/** The public shape. Deliberately has no status, version, or authorId — the
 *  API does not send them to anonymous callers. */
export interface PostSummary {
  id: string
  type: PostType
  title: string
  slug: string
  summary: string
  coverImageUrl: string | null
  coverAltText: string | null
  category: PostCategoryRef | null
  authorName: string
  publishedAt: string
  isPinned: boolean
  tags: PostTagRef[]
}

export interface PostDetail extends Omit<PostSummary, 'isPinned'> {
  body: string
  updatedAt: string
  expiresAt: string | null
  attachmentUrl: string | null
  metaTitle: string
  metaDescription: string
  tags: PostTagRef[]
}

/** The management shape, with the editorial state the public one omits. */
export interface PostAdminSummary {
  id: string
  type: PostType
  title: string
  slug: string
  status: ContentStatus
  category: PostCategoryRef | null
  authorName: string
  publishedAt: string | null
  pinnedAt: string | null
  version: number
  updatedAt: string
  deletedAt: string | null
}

export interface PostAdminDetail extends PostAdminSummary {
  summary: string
  body: string
  coverFileId: string | null
  coverAltText: string | null
  coverImageUrl: string | null
  scheduledAt: string | null
  expiresAt: string | null
  attachmentFileId: string | null
  metaTitle: string | null
  metaDescription: string | null
  /** Resolved labels. Writes send names, not ids — tags are created on use. */
  tags: PostTagRef[]
  authorId: string
  createdAt: string
}

export interface CreatePostPayload {
  type: PostType
  title: string
  summary: string
  body: string
  slug?: string
  coverFileId?: string
  coverAltText?: string
  categoryId?: string
  metaTitle?: string
  metaDescription?: string
  /** Labels as typed. Omit to leave existing tags alone; [] clears them. */
  tags?: string[]
  expiresAt?: string
  attachmentFileId?: string
}

/** `version` is what the server matches on; sending a stale one returns 409
 *  rather than overwriting a concurrent save. */
export type UpdatePostPayload = Partial<Omit<CreatePostPayload, 'type'>> & {
  version: number
}

export interface PublishPostPayload {
  version: number
  scheduledAt?: string
}

/** Every state transition carries the version the editor loaded (FR-013). */
export interface VersionPayload {
  version: number
}

export interface PinPostPayload extends VersionPayload {
  pinned: boolean
}

export interface PostQuery {
  page?: number
  limit?: number
  type?: PostType
  status?: ContentStatus
  categoryId?: string
  search?: string
  includeDeleted?: boolean
}

export interface PublicPostQuery {
  type: PostType
  page?: number
  limit?: number
  categorySlug?: string
  tagSlug?: string
  search?: string
  /** Pengumuman only: 'active' hides expired notices, 'archive' shows them. */
  scope?: 'active' | 'archive'
}

export const POST_TYPE_LABELS: Record<PostType, string> = {
  BERITA: 'Berita',
  ARTIKEL: 'Artikel',
  PENGUMUMAN: 'Pengumuman',
}

export const CONTENT_STATUS_LABELS: Record<ContentStatus, string> = {
  DRAFT: 'Draf',
  SCHEDULED: 'Terjadwal',
  PUBLISHED: 'Terbit',
  ARCHIVED: 'Arsip',
}

/** Public route segment per type, matching the backend's address space. */
export const POST_TYPE_SLUGS: Record<PostType, string> = {
  BERITA: 'berita',
  ARTIKEL: 'artikel',
  PENGUMUMAN: 'pengumuman',
}
