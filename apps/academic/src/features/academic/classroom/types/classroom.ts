import type { AcademicYear } from '@/features/academic/academic-year'
import type { Curricula } from '@/features/academic/curriculum'
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
  curriculumId: string
  academicYearId: string
  gradeId: string
  classroomLevelId?: string // backwards compatibility
  code: string
  name: string | null
  displayName: string
  capacity: number
  isActive: boolean
  deletedAt?: string | null
  curriculum?: Curricula & { academicYear?: AcademicYear }
  academicYear?: AcademicYear
  grade?: Grade
  classroomLevel?: Grade // backwards compatibility
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
}
