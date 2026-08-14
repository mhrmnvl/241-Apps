import { Prisma } from '@prisma/client';
import { USER_REF_SELECT } from '../../../../shared/domain/prisma-selects.js';

export const CLASSROOM_WITH_DETAILS_INCLUDE = {
  grade: true,
  academicYear: true,
  /**
   * The homeroom teacher for one semester, which `@@unique([classroomId,
   * semesterId])` guarantees is at most one row.
   *
   * It travels with the classroom because "who is the homeroom teacher" is a
   * question about the classroom, and answering it anywhere else means
   * answering it twice. academic-web used to read every assignment ever made
   * and pick a winner in the browser: a classroom with no assignment in the
   * current semester got whichever older row happened to arrive first, and
   * past a thousand rows some classrooms silently got none.
   */
  classroomSupervisors: {
    where: { deletedAt: null },
    take: 1,
    include: { teacher: { include: { user: USER_REF_SELECT } } },
  },
  _count: {
    select: {
      enrollments: { where: { deletedAt: null } },
      teachingAssignments: { where: { deletedAt: null } },
    },
  },
} satisfies Prisma.ClassroomInclude;

/**
 * The same shape, narrowed to one semester.
 *
 * With no semester resolved the filter stays open rather than matching
 * nothing — a school mid-way through setting up its first semester should see
 * the homeroom teacher it has just assigned, not an empty column.
 */
export function classroomWithDetailsInclude(
  semesterId: string | null | undefined,
) {
  return {
    ...CLASSROOM_WITH_DETAILS_INCLUDE,
    classroomSupervisors: {
      ...CLASSROOM_WITH_DETAILS_INCLUDE.classroomSupervisors,
      where: {
        deletedAt: null,
        ...(semesterId ? { semesterId } : {}),
      },
    },
  } satisfies Prisma.ClassroomInclude;
}

export type ClassroomWithDetails = Prisma.ClassroomGetPayload<{
  include: typeof CLASSROOM_WITH_DETAILS_INCLUDE;
}>;

export const SUPERVISOR_WITH_DETAILS_INCLUDE = {
  classroom: true,
  teacher: {
    include: {
      user: USER_REF_SELECT,
    },
  },
  semester: { include: { academicYear: true } },
} satisfies Prisma.ClassroomSupervisorInclude;

export const CLASSROOM_SUPERVISOR_WITH_DETAILS_INCLUDE =
  SUPERVISOR_WITH_DETAILS_INCLUDE;

export type SupervisorWithDetails = Prisma.ClassroomSupervisorGetPayload<{
  include: typeof SUPERVISOR_WITH_DETAILS_INCLUDE;
}>;

export const STRUCTURE_WITH_DETAILS_INCLUDE = {
  classroom: true,
  semester: { include: { academicYear: true } },
  president: {
    include: {
      user: USER_REF_SELECT,
    },
  },
  vicePresident: {
    include: {
      user: USER_REF_SELECT,
    },
  },
  secretary: {
    include: {
      user: USER_REF_SELECT,
    },
  },
  treasurer: {
    include: {
      user: USER_REF_SELECT,
    },
  },
} satisfies Prisma.ClassroomStructureInclude;

export const CLASSROOM_STRUCTURE_WITH_DETAILS_INCLUDE =
  STRUCTURE_WITH_DETAILS_INCLUDE;

export type StructureWithDetails = Prisma.ClassroomStructureGetPayload<{
  include: typeof STRUCTURE_WITH_DETAILS_INCLUDE;
}>;
