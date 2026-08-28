import type { Classroom } from './classroom'
import type { ClassroomStructure } from './structure'
import type { ClassroomEnrollment } from './enrollment'
import type { TeachingAssignment } from '@/features/academic/teaching-assignment'

/**
 * A student's own classroom, as `GET /students/me/classroom` answers it.
 *
 * One room, not a page of them — there is no id in the request and no list in
 * the response. What it carries is what a student came to find out: who runs
 * the class, who teaches it, and who else is in it.
 */
export interface MyClassroom {
  classroom: Classroom
  /** Ketua, wakil, sekretaris, bendahara — null before the class elects them. */
  structure: ClassroomStructure | null
  /** Null before a homeroom teacher is assigned. */
  supervisor: {
    id?: string
    teacher?: { user?: { profile?: { name?: string | null } | null } | null }
  } | null
  classmates: ClassroomEnrollment[]
  /** What the class is taught this term, and by whom. */
  subjects: TeachingAssignment[]
}
