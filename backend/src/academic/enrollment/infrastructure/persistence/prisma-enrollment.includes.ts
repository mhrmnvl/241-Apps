import { Prisma } from '@prisma/client';
import { PROFILE_ROSTER_SELECT } from '../../../../shared/domain/prisma-selects.js';

export const ENROLLMENT_WITH_DETAILS_INCLUDE = {
  student: {
    include: {
      user: {
        include: {
          profile: PROFILE_ROSTER_SELECT,
        },
      },
    },
  },
  classroom: {
    include: { grade: true },
  },
  semester: { include: { academicYear: true } },
} satisfies Prisma.StudentEnrollmentInclude;

export type EnrollmentWithDetails = Prisma.StudentEnrollmentGetPayload<{
  include: typeof ENROLLMENT_WITH_DETAILS_INCLUDE;
}>;
