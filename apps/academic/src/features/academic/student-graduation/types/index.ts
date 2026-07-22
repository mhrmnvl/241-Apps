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
