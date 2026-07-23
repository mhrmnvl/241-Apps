export interface FileCategory {
  id: string
  code: string
  name: string
  description?: string | null
  isSystem: boolean
}

export interface FileItem {
  id: string
  organizationId: string
  schoolUnitId?: string | null
  categoryId?: string | null
  uploadedBy?: string | null
  filename: string
  originalName: string
  mimeType: string
  sizeBytes: number
  storageKey: string
  /** Signed, time-limited download URL (storage bucket is private). */
  url: string
  createdAt: string
  category?: FileCategory | null
}
