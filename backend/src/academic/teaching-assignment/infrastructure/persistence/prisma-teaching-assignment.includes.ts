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
  // `type` as well as the year: the assignment table shows "Ganjil 2026/2027",
  // and without the relation the screen compared an absent field to 'ODD',
  // which is false for every row — so every assignment read "Genap", in Ganjil
  // as much as in Genap. Wrong and quiet is worse than wrong and obvious.
  semester: { include: { academicYear: true, type: true } },
  schedules: {
    where: { deletedAt: null },
    include: { timeSlot: { include: { type: true } } },
  },
} satisfies Prisma.TeachingAssignmentInclude;

export type TeachingAssignmentWithDetails =
  Prisma.TeachingAssignmentGetPayload<{
    include: typeof TEACHING_ASSIGNMENT_WITH_DETAILS_INCLUDE;
  }>;
