import { Prisma } from '@prisma/client';

export const ACADEMIC_YEAR_WITH_DETAILS_INCLUDE = {
  semesters: {
    where: { deletedAt: null },
    include: { type: true },
  },
  _count: {
    select: {
      classrooms: { where: { deletedAt: null } },
      curricula: { where: { deletedAt: null } },
    },
  },
} satisfies Prisma.AcademicYearInclude;

export type AcademicYearWithDetails = Prisma.AcademicYearGetPayload<{
  include: typeof ACADEMIC_YEAR_WITH_DETAILS_INCLUDE;
}>;
