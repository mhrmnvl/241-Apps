import { Prisma } from '@prisma/client';

export const STUDENT_PARENT_INCLUDE = {
  parent: {
    include: {
      occupation: true,
      education: true,
    },
  },
} satisfies Prisma.StudentParentInclude;

export type StudentParentWithDetails = Prisma.StudentParentGetPayload<{
  include: typeof STUDENT_PARENT_INCLUDE;
}>;
