import { Prisma } from '@prisma/client';
import { USER_REF_SELECT } from '../../../../shared/domain/prisma-selects.js';

export const TEACHING_ASSIGNMENT_WITH_DETAILS_INCLUDE = {
  teacher: {
    include: {
      user: USER_REF_SELECT,
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
