import { Prisma } from '@prisma/client';
import { USER_REF_SELECT } from '../../../../shared/domain/prisma-selects.js';

export const GRADUATION_WITH_DETAILS_INCLUDE = {
  student: {
    include: {
      user: USER_REF_SELECT,
    },
  },
  academicYear: true,
} satisfies Prisma.StudentGraduationInclude;

export type GraduationWithDetails = Prisma.StudentGraduationGetPayload<{
  include: typeof GRADUATION_WITH_DETAILS_INCLUDE;
}>;
