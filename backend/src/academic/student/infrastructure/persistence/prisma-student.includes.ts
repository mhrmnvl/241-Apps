import { Prisma } from '@prisma/client';

export const STUDENT_INCLUDE = {
  user: {
    select: {
      id: true,
      identifier: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      profile: true,
    },
  },
  grade: true,
  enrollments: {
    where: { deletedAt: null },
    include: {
      classroom: true,
      semester: { include: { academicYear: true } },
    },
    orderBy: { enrolledAt: 'desc' as const },
  },
} satisfies Prisma.StudentInclude;

export const STUDENT_LIST_INCLUDE = STUDENT_INCLUDE;
export const STUDENT_DETAIL_INCLUDE = STUDENT_INCLUDE;

export type StudentWithDetails = Prisma.StudentGetPayload<{
  include: typeof STUDENT_INCLUDE;
}>;
