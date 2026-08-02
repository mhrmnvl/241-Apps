import { Prisma } from '@prisma/client';

export const TEACHER_POSITION_INCLUDE = {
  position: { include: { category: true } },
} satisfies Prisma.TeacherPositionInclude;

export type TeacherPositionWithDetails = Prisma.TeacherPositionGetPayload<{
  include: typeof TEACHER_POSITION_INCLUDE;
}>;
