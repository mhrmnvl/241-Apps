import type { AcademicYear } from '@/features/academic/academic-year'
import type { Semester } from '@/features/academic/semester'

export interface Grade {
  id: string
  level: number
  name: string
  isActive: boolean
}

export type ClassroomLevel = Grade

export interface ClassroomSupervisorProfile {
  name?: string | null
}

export interface ClassroomSupervisorUser {
  profile?: ClassroomSupervisorProfile | null
}

export interface ClassroomSupervisor {
  id: string
  nip?: string | null
  user?: ClassroomSupervisorUser | null
}

export interface Classroom {
  id: string
  academicYearId: string
  gradeId: string
  classroomLevelId?: string
  code: string
  name: string | null
  displayName: string
  capacity: number
  isActive: boolean
  deletedAt?: string | null
  academicYear?: AcademicYear
  grade?: Grade
  classroomLevel?: Grade
  /**
   * The homeroom teacher for the current semester, as the list endpoint
   * resolved it. At most one element: the database allows a single supervisor
   * per classroom per semester, and the query is scoped to one semester.
   */
  classroomSupervisors?: { teacher?: ClassroomSupervisor | null }[]
  supervisor?: ClassroomSupervisor
  supervisorAssignment?: ClassroomSupervisorAssignment
}

export interface ClassroomSupervisorAssignment {
  id: string
  classroomId: string
  teacherId: string
  semesterId: string
  teacher?: TeacherOption
  semester?: Semester
}

export interface TeacherOption {
  id: string
  nip?: string | null
  user?: ClassroomSupervisorUser | null
}

export interface ClassroomColumnActions {
  onManageSupervisor?: (classroom: Classroom) => void
  onDelete?: (
    classroom: Classroom,
    callbacks: { closeAlert: () => void; setLoading: (s: boolean) => void },
  ) => Promise<void>
  showActions?: boolean
  /** Per-action gates — hide edit/delete when the user lacks that permission. */
  canUpdate?: boolean
  canDelete?: boolean
}
