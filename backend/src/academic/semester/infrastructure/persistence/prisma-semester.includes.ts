import { Prisma } from '@prisma/client';

export const SEMESTER_WITH_DETAILS_INCLUDE = {
  academicYear: true,
  type: true,
  _count: {
    select: {
      enrollments: { where: { deletedAt: null } },
      teachingAssignments: { where: { deletedAt: null } },
    },
  },
} satisfies Prisma.SemesterInclude;

export type SemesterWithDetails = Prisma.SemesterGetPayload<{
  include: typeof SEMESTER_WITH_DETAILS_INCLUDE;
}>;
