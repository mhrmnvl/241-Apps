import { Prisma } from '@prisma/client';
import type {
  TeacherQueryInput,
  ExportTeacherQueryInput,
} from '../../domain/interfaces/teacher-repository.interface.js';

/** Free-text search spans both identifiers plus the profile name. */
function searchFilter(search: string): Prisma.TeacherWhereInput {
  return {
    OR: [
      { nip: { contains: search, mode: 'insensitive' } },
      { nuptk: { contains: search, mode: 'insensitive' } },
      {
        user: {
          profile: { name: { contains: search, mode: 'insensitive' } },
        },
      },
    ],
  };
}

/**
 * Where-clause for the paginated teacher list.
 *
 * A teacher counts as belonging to an academic year through either route they
 * can be attached by: supervising a classroom, or holding a teaching
 * assignment in one of that year's semesters.
 */
export function buildTeacherListWhere(
  query: TeacherQueryInput,
  resolvedAcademicYearId?: string,
): Prisma.TeacherWhereInput {
  const { search, employmentTypeId, positionCategoryId, isActive } = query;

  return {
    deletedAt: null,
    user: { ...(isActive !== undefined && { isActive }) },
    ...(employmentTypeId && { employmentTypeId }),
    ...(positionCategoryId && {
      teacherPositions: {
        some: {
          isPrimary: true,
          deletedAt: null,
          position: { categoryId: positionCategoryId },
        },
      },
    }),
    ...(resolvedAcademicYearId && {
      OR: [
        {
          classroomSupervisors: {
            some: { semester: { academicYearId: resolvedAcademicYearId } },
          },
        },
        {
          teachingAssignments: {
            some: { semester: { academicYearId: resolvedAcademicYearId } },
          },
        },
      ],
    }),
    ...(search && searchFilter(search)),
  };
}

/** Where-clause for the unpaginated Excel export. */
export function buildTeacherExportWhere(
  filters: ExportTeacherQueryInput,
): Prisma.TeacherWhereInput {
  const { search, employmentTypeId, isActive } = filters;

  return {
    deletedAt: null,
    user: { ...(isActive !== undefined && { isActive }) },
    ...(employmentTypeId && { employmentTypeId }),
    ...(search && searchFilter(search)),
  };
}
