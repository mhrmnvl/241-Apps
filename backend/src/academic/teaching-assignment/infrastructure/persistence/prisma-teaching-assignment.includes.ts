import { Prisma } from '@prisma/client';

export const TEACHING_ASSIGNMENT_WITH_DETAILS_INCLUDE = {
  teacher: {
    include: {
      user: {
        include: {
          profile: true,
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
