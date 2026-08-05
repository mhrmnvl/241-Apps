import { Prisma } from '@prisma/client';
import type {
  StudentQueryInput,
  ExportStudentQueryInput,
} from '../../domain/interfaces/student-repository.interface.js';

/** Free-text search spans the two identifiers plus the profile name. */
function searchFilter(search: string): Prisma.StudentWhereInput {
  return {
    OR: [
      { nis: { contains: search, mode: 'insensitive' } },
      { nisn: { contains: search, mode: 'insensitive' } },
      {
        user: {
          profile: { name: { contains: search, mode: 'insensitive' } },
        },
      },
    ],
  };
}

/**
 * Where-clause for the paginated student list.
 *
 * `classroomId` is applied inside the semester filter when a semester is given,
 * so "class VII-A in semester X" narrows to that semester's enrolments rather
 * than matching any enrolment the student has ever had in that classroom.
 */
export function buildStudentListWhere(
  query: StudentQueryInput,
): Prisma.StudentWhereInput {
  const { search, semesterId, classroomId, status, isActive } = query;

  return {
    deletedAt: null,
    ...(isActive !== undefined && { user: { isActive } }),
    ...(status && { status }),
    ...(semesterId && {
      enrollments: {
        some: {
          semesterId,
          deletedAt: null,
          ...(classroomId && { classroomId }),
        },
      },
    }),
    ...(!semesterId &&
      classroomId && {
        enrollments: { some: { classroomId, deletedAt: null } },
      }),
    ...(search && searchFilter(search)),
  };
}

/** Where-clause for the unpaginated Excel export. */
export function buildStudentExportWhere(
  filters: ExportStudentQueryInput,
): Prisma.StudentWhereInput {
  const { search, classroomId, isActive } = filters;

  return {
    deletedAt: null,
    ...(isActive !== undefined && { user: { isActive } }),
    ...(classroomId && {
      enrollments: { some: { classroomId, deletedAt: null } },
    }),
    ...(search && searchFilter(search)),
  };
}
