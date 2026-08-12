import { Prisma } from '@prisma/client';
import { PROFILE_NAME_SELECT } from '../../../../shared/domain/prisma-selects.js';

export const TEACHING_ASSIGNMENT_WITH_DETAILS_INCLUDE = {
  teacher: {
    include: {
      user: {
        include: {
          profile: PROFILE_NAME_SELECT,
        },
      },
    },
  },
  subject: true,
  classroom: true,
  semester: { include: { academicYear: true } },
  schedules: {
    where: { deletedAt: null },
    include: { timeSlot: { include: { type: true } } },
  },
} satisfies Prisma.TeachingAssignmentInclude;

export type TeachingAssignmentWithDetails =
  Prisma.TeachingAssignmentGetPayload<{
    include: typeof TEACHING_ASSIGNMENT_WITH_DETAILS_INCLUDE;
  }>;
