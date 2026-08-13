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

/** A student the bulk screen may graduate: final grade, still enrolled. */
export interface GraduationCandidate {
  studentId: string
  studentName: string
  nis: string
  classroomId: string
  classroomName: string
  gradeName: string
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
}

export interface BulkGraduationResult {
  graduated: number
  /** Already held a record — a re-run is safe and says so. */
  skipped: number
}
