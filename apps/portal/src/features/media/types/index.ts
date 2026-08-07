/**
 * A file in the portal's media library.
 *
 * Two URLs, and mixing them up is the one mistake this feature exists to make
 * impossible:
 *
 * - `previewUrl` is a signed, expiring URL. It renders the thumbnail inside the
 *   authenticated picker, where most items belong to drafts and have no public
 *   address yet. It must never reach content.
 * - `publicUrl` is the stable `/portal/public/media/:id` address. It is what
 *   goes into a post body, a cover, or an `og:image`. It 404s until published
 *   content references the file — which is the point.
 */
export interface MediaLibraryItem {
  id: string
  filename: string
  originalName: string
  mimeType: string
  sizeBytes: number
  createdAt: string
  previewUrl: string
  publicUrl: string
}

/** What the editor picked: the public address plus the text they wrote. */
export interface MediaSelection {
  fileId: string
  publicUrl: string
  altText: string
  /**
   * Only collected where a caption is meaningful — a gallery photo (FR-048).
   * A cover image or an in-body image has no caption to show, so the field is
   * absent rather than empty for those.
   */
  caption?: string
}

export interface MediaUsageOwner {
  kind: 'COVER' | 'BODY' | 'ATTACHMENT' | 'ALBUM_PHOTO'
  ownerType: 'post' | 'agenda' | 'album' | 'page'
  ownerId: string
  title: string
  isPublic: boolean
}

export interface MediaUsage {
  fileId: string
  isPubliclyReachable: boolean
  usedBy: MediaUsageOwner[]
}
