import { Prisma } from '@prisma/client';
import { PROFILE_NAME_SELECT } from '../../../../shared/domain/prisma-selects.js';

export const GRADUATION_WITH_DETAILS_INCLUDE = {
  student: {
    include: {
      user: {
        include: {
          profile: PROFILE_NAME_SELECT,
        },
      },
    },
  },
  academicYear: true,
} satisfies Prisma.StudentGraduationInclude;

export type GraduationWithDetails = Prisma.StudentGraduationGetPayload<{
  include: typeof GRADUATION_WITH_DETAILS_INCLUDE;
}>;
