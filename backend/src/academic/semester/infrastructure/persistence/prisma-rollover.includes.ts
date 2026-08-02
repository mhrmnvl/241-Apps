import { Prisma } from '@prisma/client';

export const SEMESTER_WITH_ACADEMIC_YEAR_INCLUDE = {
  academicYear: true,
} satisfies Prisma.SemesterInclude;

export type SemesterWithAcademicYear = Prisma.SemesterGetPayload<{
  include: typeof SEMESTER_WITH_ACADEMIC_YEAR_INCLUDE;
}>;
