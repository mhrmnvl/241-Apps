/**
 * Teachers are absent by design: an assignment is per (classroom, semester),
 * so it is created on the Penugasan Mengajar page, not by editing a subject.
 */
export interface SubjectSavePayload {
  name: string
  code: string
}

export interface SubjectQueryParams {
  page?: number
  limit?: number
  search?: string
}
