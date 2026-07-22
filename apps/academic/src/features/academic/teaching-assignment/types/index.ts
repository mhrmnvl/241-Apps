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
  type: 'ODD' | 'EVEN'
  academicYear?: TeachingAssignmentAcademicYear
}

export interface TeachingAssignment {
  id: string
  teacherId: string
  classroomId: string
  subjectId: string
  semesterId: string
  teacher?: TeachingAssignmentTeacher
  classroom?: TeachingAssignmentClassroom
  subject?: TeachingAssignmentSubject
  semester?: TeachingAssignmentSemester
}

export interface TeachingAssignmentSavePayload {
  teacherId: string
  classroomId: string
  subjectId: string
  semesterId: string
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
