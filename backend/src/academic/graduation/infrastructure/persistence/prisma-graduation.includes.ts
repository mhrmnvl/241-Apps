import { Prisma } from '@prisma/client';

export const GRADUATION_WITH_DETAILS_INCLUDE = {
  student: {
    include: {
      user: {
        include: {
          profile: true,
        },
      },
    },
  },
  academicYear: true,
} satisfies Prisma.StudentGraduationInclude;

export type GraduationWithDetails = Prisma.StudentGraduationGetPayload<{
  include: typeof GRADUATION_WITH_DETAILS_INCLUDE;
}>;
