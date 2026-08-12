export interface CurriculumSubjectAcademicYear {
  id: string
  name: string
}

export interface CurriculumSubjectCurriculum {
  id: string
  name: string
  academicYear?: CurriculumSubjectAcademicYear
}

export interface CurriculumSubjectSubject {
  id: string
  name: string
  code?: string | null
}

export interface CurriculumSubject {
  id: string
  curriculumId: string
  subjectId: string
  hoursPerWeek: number
  /**
   * Minimum pass mark, shown as "KKM".
   *
   * It lives on the curriculum rather than on the subject so retuning it never
   * disturbs the subject catalogue, and so two curricula can hold the same
   * subject to different standards. A teacher may override it for one class
   * they teach, on Penugasan Mengajar.
   */
  passingScore: number
  curriculum?: CurriculumSubjectCurriculum
  subject?: CurriculumSubjectSubject
}

export interface CurriculumSubjectSavePayload {
  curriculumId: string
  subjectId: string
  hoursPerWeek?: number
  passingScore?: number
}

export interface CurriculumSubjectQueryParams {
  page?: number
  limit?: number
  curriculumId?: string
  subjectId?: string
}

export interface CurriculumSubjectColumnActions {
  onEdit?: (item: CurriculumSubject) => void
  onDelete?: (
    item: CurriculumSubject,
    callbacks: { closeAlert: () => void; setLoading: (s: boolean) => void },
  ) => Promise<void>
  showActions?: boolean
  /** Per-action gates — hide edit/delete when the user lacks that permission. */
  canUpdate?: boolean
  canDelete?: boolean
}
