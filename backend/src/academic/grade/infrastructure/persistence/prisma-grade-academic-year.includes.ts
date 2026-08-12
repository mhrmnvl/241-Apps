import { Prisma } from '@prisma/client';

/**
 * Selected field by field to match what the domain row actually declares.
 *
 * All three used to be bare `true`, which pulled every column of every related
 * record — `curricula` most wastefully, since the domain row types it as a
 * `NamedRef` and only ever reads its id and name.
 *
 * `curricula` is a to-one relation, so soft-deleted rows cannot be excluded in
 * the include; a caller that must ignore a deleted curriculum checks
 * `curricula.deletedAt`, which is why that column is selected.
 */
export const GRADE_ACADEMIC_YEAR_INCLUDE = {
  grade: {
    select: { id: true, level: true, name: true, deletedAt: true },
  },
  academicYear: {
    select: { id: true, name: true, isActive: true, deletedAt: true },
  },
  curricula: {
    select: { id: true, name: true, deletedAt: true },
  },
} satisfies Prisma.GradeAcademicYearInclude;

export const GRADE_AY_WITH_DETAILS_INCLUDE = GRADE_ACADEMIC_YEAR_INCLUDE;

export type GradeAcademicYearWithDetails = Prisma.GradeAcademicYearGetPayload<{
  include: typeof GRADE_ACADEMIC_YEAR_INCLUDE;
}>;
