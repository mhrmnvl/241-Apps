export interface TeachingAssignmentProfile {
  name?: string | null
}

export interface TeachingAssignmentUser {
  profile?: TeachingAssignmentProfile | null
}

export interface TeachingAssignmentTeacher {
  id: string
  nip?: string | null
  user?: TeachingAssignmentUser
}

export interface TeachingAssignmentSubject {
  id: string
  name: string
  code: string
}

/**
 * What the subject dropdown needs, and no more.
 *
 * Deliberately narrower than `Subject`: the options come from the active
 * curriculum (`CurriculumSubject.subject`, whose `code` is nullable) as well
 * as from the plain subject list, so the shared shape has to admit both.
 */
export interface TeachingAssignmentSubjectOption {
  id: string
  name: string
  code?: string | null
}

export interface TeachingAssignmentClassroom {
  id: string
  name: string
}

export interface TeachingAssignmentAcademicYear {
  id: string
  name: string
}

export interface TeachingAssignmentSemester {
  id: string
  /**
   * The term, as a relation — `{ name: 'ODD' | 'EVEN' }`.
   *
   * Declared `'ODD' | 'EVEN'` until 2026-08-16, which compiled and was never
   * true: the backend did not include the relation at all, so `type` arrived
   * undefined and `sem.type === 'ODD'` was false for every row. The Semester
   * column read "Genap" all year, in Ganjil as much as in Genap.
   */
  type?: {
    name: string
  }
  academicYear?: TeachingAssignmentAcademicYear
}

export interface TeachingAssignment {
  id: string
  teacherId: string
  classroomId: string
  subjectId: string
  semesterId: string
  /**
   * Overrides the subject's own KKM for this class only. Null means follow the
   * subject default, which is the normal case.
   */
  passingScore?: number | null
  teacher?: TeachingAssignmentTeacher
  classroom?: TeachingAssignmentClassroom
  subject?: TeachingAssignmentSubject
  semester?: TeachingAssignmentSemester
}

/**
 * Creating covers several classes in one go — one assignment row per class —
 * because a teacher normally takes the same subject across a whole grade.
 */
export interface TeachingAssignmentCreatePayload {
  teacherId: string
  classroomIds: string[]
  subjectId: string
  semesterId: string
}

/** Editing touches exactly one existing row, so the class is singular. */
export interface TeachingAssignmentUpdatePayload {
  teacherId: string
  classroomId: string
  subjectId: string
  semesterId: string
  /** Null clears the override so the subject's KKM applies again. */
  passingScore?: number | null
}

/** A classroom that already had this assignment and was left untouched. */
export interface SkippedClassroom {
  classroomId: string
  reason: string
}

export interface TeachingAssignmentCreateResult {
  created: TeachingAssignment[]
  skipped: SkippedClassroom[]
}

export interface TeachingAssignmentQueryParams {
  page?: number
  limit?: number
  teacherId?: string
  classroomId?: string
  subjectId?: string
  semesterId?: string
}

export interface TeachingAssignmentColumnActions {
  onEdit?: (item: TeachingAssignment) => void
  onDelete?: (
    item: TeachingAssignment,
    callbacks: { closeAlert: () => void; setLoading: (s: boolean) => void },
  ) => Promise<void>
  showActions?: boolean
  /** Per-action gates — hide edit/delete when the user lacks that permission. */
  canUpdate?: boolean
  canDelete?: boolean
}
