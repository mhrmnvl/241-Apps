import { Prisma } from '@prisma/client';

export const SUBJECT_INCLUDE = {
  _count: {
    select: {
      teachingAssignments: {
        where: { deletedAt: null },
      },
    },
  },
} satisfies Prisma.SubjectInclude;

export const SUBJECT_WITH_COUNT_INCLUDE = SUBJECT_INCLUDE;

export type SubjectWithCount = Prisma.SubjectGetPayload<{
  include: typeof SUBJECT_INCLUDE;
}>;
