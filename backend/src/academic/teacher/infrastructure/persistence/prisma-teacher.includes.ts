import { Prisma } from '@prisma/client';
import { PROFILE_ROSTER_SELECT } from '../../../../shared/domain/prisma-selects.js';

/**
 * Three reads, because a teacher is needed at three widths.
 *
 * They used to share one `USER_SELECT` carrying the whole profile, which meant
 * the list page paid for every column the spreadsheet export needed. Splitting
 * them is what lets the list narrow without breaking the export.
 */

/** The list shows a name, a gender and a NIP/NIK. Nothing else. */
const USER_LIST_SELECT = {
  id: true,
  identifier: true,
  isActive: true,
  profile: PROFILE_ROSTER_SELECT,
} as const;

/**
 * The spreadsheet has a column per personal field, so this one legitimately
 * reads them — stated here rather than widening a shared shape for one caller.
 */
const USER_EXPORT_SELECT = {
  id: true,
  identifier: true,
  isActive: true,
  profile: {
    select: {
      name: true,
      nik: true,
      gender: true,
      birthPlace: true,
      birthDate: true,
      email: true,
      phone: true,
    },
  },
} as const;

/** The detail screen keeps the full profile; narrowing it is a separate step. */
export const USER_SELECT = {
  id: true,
  identifier: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
  profile: true,
} as const;

export const TEACHER_LIST_INCLUDE = {
  user: { select: USER_LIST_SELECT },
  employmentType: true,
  teacherPositions: {
    where: { isPrimary: true },
    include: { position: { include: { category: true } } },
  },
} satisfies Prisma.TeacherInclude;

export const TEACHER_EXPORT_INCLUDE = {
  user: { select: USER_EXPORT_SELECT },
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

export type TeacherExportWithDetails = Prisma.TeacherGetPayload<{
  include: typeof TEACHER_EXPORT_INCLUDE;
}>;

export type TeacherPositionWithDetails = Prisma.TeacherPositionGetPayload<{
  include: typeof TEACHER_POSITION_INCLUDE;
}>;
