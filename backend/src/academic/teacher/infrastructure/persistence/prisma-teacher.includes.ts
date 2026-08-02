import { Prisma } from '@prisma/client';

export const USER_SELECT = {
  id: true,
  identifier: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  profile: true,
} as const;

export const TEACHER_LIST_INCLUDE = {
  user: { select: USER_SELECT },
  employmentType: true,
  teacherPositions: {
    where: { isPrimary: true },
    include: { position: { include: { category: true } } },
  },
} satisfies Prisma.TeacherInclude;

export const TEACHER_DETAIL_INCLUDE = {
  user: { select: USER_SELECT },
  employmentType: true,
  addresses: {
    omit: {
      studentId: true,
      teacherId: true,
      parentId: true,
    },
    orderBy: { isPrimary: 'desc' as const },
  },
  teacherPositions: {
    include: { position: { include: { category: true } } },
    orderBy: [{ isPrimary: 'desc' as const }, { hireDate: 'desc' as const }],
  },
} satisfies Prisma.TeacherInclude;

export const TEACHER_POSITION_INCLUDE = {
  position: { include: { category: true } },
} satisfies Prisma.TeacherPositionInclude;

export type TeacherWithDetails = Prisma.TeacherGetPayload<{
  include: typeof TEACHER_DETAIL_INCLUDE;
}>;

export type TeacherListWithDetails = Prisma.TeacherGetPayload<{
  include: typeof TEACHER_LIST_INCLUDE;
}>;

export type TeacherPositionWithDetails = Prisma.TeacherPositionGetPayload<{
  include: typeof TEACHER_POSITION_INCLUDE;
}>;
