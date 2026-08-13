import { Prisma } from '@prisma/client';
import { PROFILE_ROSTER_SELECT } from '../../../../shared/domain/prisma-selects.js';

export const STUDENT_INCLUDE = {
  user: {
    select: {
      id: true,
      identifier: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      profile: PROFILE_ROSTER_SELECT,
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

/**
 * The spreadsheet export, which has a column per personal field.
 *
 * It used to share the list's include. When the list narrowed to the three
 * fields it displays, the export kept compiling — the domain row types those
 * columns as optional, so their absence reads as "not set" rather than as an
 * error — and would have written four empty columns. Hence its own include.
 */
export const STUDENT_EXPORT_INCLUDE = {
  ...STUDENT_INCLUDE,
  user: {
    select: {
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
    },
  },
} satisfies Prisma.StudentInclude;

export type StudentWithDetails = Prisma.StudentGetPayload<{
  include: typeof STUDENT_INCLUDE;
}>;

export type StudentExportWithDetails = Prisma.StudentGetPayload<{
  include: typeof STUDENT_EXPORT_INCLUDE;
}>;
