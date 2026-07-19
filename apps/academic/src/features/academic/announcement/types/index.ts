export interface AnnouncementClassroomItem {
  id: string
  classroomId: string
  classroom?: {
    id: string
    name: string
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
  onEdit?: (item: Announcement) => void
  onDelete?: (
    item: Announcement,
    callbacks: { closeAlert: () => void; setLoading: (s: boolean) => void },
  ) => Promise<void>
  showActions?: boolean
}
