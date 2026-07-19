import type { Classroom } from './classroom'

export interface ClassroomStructureStudent {
  id: string
  nis: string
  user: {
    id: string
    profile: { name: string }
  }
}

export interface ClassroomStructure {
  id: string
  classroomId: string
  semesterId: string
  presidentId: string | null
  vicePresidentId: string | null
  secretaryId: string | null
  treasurerId: string | null
  classroom?: Classroom
  semester?: {
    id: string
    type: string
    academicYear: { id: string; name: string }
  }
  president: ClassroomStructureStudent | null
  vicePresident: ClassroomStructureStudent | null
  secretary: ClassroomStructureStudent | null
  treasurer: ClassroomStructureStudent | null
}
