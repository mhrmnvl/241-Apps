export interface AnnouncementClassroomItem {
  id: string
  classroomId: string
  /**
   * The whole classroom row, as the endpoint includes it.
   *
   * `code` was missing from this declaration although the server has always
   * sent it, so the target column fell back to `name` — which a class may not
   * have — and printed a dash for a class the school calls VII-A.
   */
  classroom?: {
    id: string
    code?: string
    name?: string | null
  }
}

export interface Announcement {
  id: string
  title: string
  description: string
  date: string
  classrooms?: AnnouncementClassroomItem[]
}

export interface AnnouncementSavePayload {
  title: string
  description: string
  date: string
  classroomIds?: string[]
}

export interface AnnouncementQueryParams {
  page?: number
  limit?: number
  classroomId?: string
  search?: string
}

export interface AnnouncementColumnActions {
  /** Opens the reading view. The table truncates; this is where it is read. */
  onPreview?: (item: Announcement) => void
  onEdit?: (item: Announcement) => void
  onDelete?: (
    item: Announcement,
    callbacks: { closeAlert: () => void; setLoading: (s: boolean) => void },
  ) => Promise<void>
  showActions?: boolean
  /** Per-action gates — hide edit/delete when the user lacks that permission. */
  canUpdate?: boolean
  canDelete?: boolean
}
