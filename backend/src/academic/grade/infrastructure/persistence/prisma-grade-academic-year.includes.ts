import { Prisma } from '@prisma/client';

export const GRADE_ACADEMIC_YEAR_INCLUDE = {
  grade: true,
  academicYear: true,
  curricula: true,
} satisfies Prisma.GradeAcademicYearInclude;

export const GRADE_AY_WITH_DETAILS_INCLUDE = GRADE_ACADEMIC_YEAR_INCLUDE;

export type GradeAcademicYearWithDetails = Prisma.GradeAcademicYearGetPayload<{
  include: typeof GRADE_ACADEMIC_YEAR_INCLUDE;
}>;
