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

export interface CurriculumSubjectClassroomLevel {
  id: string
  name: string
  level: number
}

export interface CurriculumSubject {
  id: string
  curriculumId: string
  classroomLevelId: string
  subjectId: string
  hoursPerWeek: number
  curriculum?: CurriculumSubjectCurriculum
  subject?: CurriculumSubjectSubject
  classroomLevel?: CurriculumSubjectClassroomLevel
}

export interface CurriculumSubjectSavePayload {
  curriculumId: string
  classroomLevelId: string
  subjectId: string
  hoursPerWeek?: number
}

export interface CurriculumSubjectQueryParams {
  page?: number
  limit?: number
  curriculumId?: string
  classroomLevelId?: string
  subjectId?: string
}

export interface CurriculumSubjectColumnActions {
  onEdit?: (item: CurriculumSubject) => void
  onDelete?: (
    item: CurriculumSubject,
    callbacks: { closeAlert: () => void; setLoading: (s: boolean) => void },
  ) => Promise<void>
  showActions?: boolean
}
