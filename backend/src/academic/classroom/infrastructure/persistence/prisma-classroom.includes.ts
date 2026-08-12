import { Prisma } from '@prisma/client';
import { PROFILE_NAME_SELECT } from '../../../../shared/domain/prisma-selects.js';

export const CLASSROOM_WITH_DETAILS_INCLUDE = {
  grade: true,
  academicYear: true,
  _count: {
    select: {
      enrollments: { where: { deletedAt: null } },
      teachingAssignments: { where: { deletedAt: null } },
    },
  },
} satisfies Prisma.ClassroomInclude;

export type ClassroomWithDetails = Prisma.ClassroomGetPayload<{
  include: typeof CLASSROOM_WITH_DETAILS_INCLUDE;
}>;

export const SUPERVISOR_WITH_DETAILS_INCLUDE = {
  classroom: true,
  teacher: {
    include: {
      user: {
        include: {
          profile: PROFILE_NAME_SELECT,
        },
      },
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
      user: {
        include: {
          profile: PROFILE_NAME_SELECT,
        },
      },
    },
  },
  vicePresident: {
    include: {
      user: {
        include: {
          profile: PROFILE_NAME_SELECT,
        },
      },
    },
  },
  secretary: {
    include: {
      user: {
        include: {
          profile: PROFILE_NAME_SELECT,
        },
      },
    },
  },
  treasurer: {
    include: {
      user: {
        include: {
          profile: PROFILE_NAME_SELECT,
        },
      },
    },
  },
} satisfies Prisma.ClassroomStructureInclude;

export const CLASSROOM_STRUCTURE_WITH_DETAILS_INCLUDE =
  STRUCTURE_WITH_DETAILS_INCLUDE;

export type StructureWithDetails = Prisma.ClassroomStructureGetPayload<{
  include: typeof STRUCTURE_WITH_DETAILS_INCLUDE;
}>;
