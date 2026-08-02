import { Prisma } from '@prisma/client';

export const ENROLLMENT_WITH_DETAILS_INCLUDE = {
  student: {
    include: {
      user: {
        include: {
          profile: true,
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
