export interface GraduationStudentProfile {
  name?: string | null
}

export interface GraduationStudentUser {
  identifier: string
  profile?: GraduationStudentProfile | null
}

export interface GraduationStudent {
  id: string
  nis: string
  nisn: string
  status: string
  user?: GraduationStudentUser
}

export interface GraduationAcademicYear {
  id: string
  name: string
  isActive: boolean
}

export interface StudentGraduation {
  id: string
  studentId: string
  academicYearId: string
  graduationDate?: string | null
  certificateNo?: string | null
  note?: string | null
  createdAt: string
  updatedAt: string
  student?: GraduationStudent
  academicYear?: GraduationAcademicYear
}

export interface StudentGraduationSavePayload {
  studentId: string
  academicYearId: string
  graduationDate?: string
  certificateNo?: string
  note?: string
}

export interface StudentGraduationQueryParams {
  page?: number
  limit?: number
  academicYearId?: string
  search?: string
}

export interface StudentGraduationColumnActions {
  onEdit?: (item: StudentGraduation) => void
  onDelete?: (
    item: StudentGraduation,
    callbacks: { closeAlert: () => void; setLoading: (s: boolean) => void },
  ) => Promise<void>
  showActions?: boolean
  /** Per-action gates — hide edit/delete when the user lacks that permission. */
  canUpdate?: boolean
  canDelete?: boolean
}

/**
 * A year the school already decided to hold this student, and why.
 *
 * A hold does not take anyone off the candidate list — it is a decision to
 * revisit, not a permanent state — so this is how the screen tells a student
 * who was held last year from one nobody has looked at yet.
 */
export interface GraduationPreviousHold {
  academicYearId: string
  academicYearName: string
  reason: string
  decidedAt: string
}

/** A student the bulk screen may graduate: final grade, still enrolled. */
export interface GraduationCandidate {
  studentId: string
  studentName: string
  nis: string
  classroomId: string
  classroomName: string
  gradeName: string
  previousHold?: GraduationPreviousHold
}

/** The year the server chose, reported so the screen shows it. */
export interface GraduationTerm {
  id: string
  name: string
}

export interface GraduationCandidateList {
  academicYear: GraduationTerm | null
  /** Which grade counts as final this year, e.g. "IX". */
  finalGradeName: string | null
  students: GraduationCandidate[]
}

/** No academic year: the server takes it from the active academic year. */
export interface BulkGraduationPayload {
  graduationDate?: string
  students: { studentId: string; certificateNo?: string; note?: string }[]
  /**
   * Students the school decided not to graduate, with the reason.
   *
   * Sent with the graduations rather than after them: both halves are one
   * decision about one class, and the server writes them in one transaction.
   */
  held?: { studentId: string; reason: string }[]
}

export interface BulkGraduationResult {
  graduated: number
  /** Already held a record — a re-run is safe and says so. */
  skipped: number
  /** Recorded as held back. A rerun rewrites the reason rather than stacking. */
  held: number
}

/** A recorded decision not to graduate a student. */
export interface GraduationHold {
  id: string
  studentId: string
  studentName: string
  nis: string
  academicYearId: string
  academicYearName: string
  reason: string
  decidedAt: string
}

export interface GraduationStudentDecision {
  studentId: string
  approved: boolean
  declineReason?: string
}
