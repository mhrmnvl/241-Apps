import { Prisma } from '@prisma/client';

/**
 * Teacher identity as the subject list renders it: the profile name, with the
 * NIP as the fallback when a teacher has no profile row yet.
 */
const TEACHING_ASSIGNMENT_SELECT = {
  id: true,
  teacherId: true,
  classroom: { select: { id: true, name: true } },
  teacher: {
    select: {
      nip: true,
      user: { select: { profile: { select: { name: true } } } },
    },
  },
} satisfies Prisma.TeachingAssignmentSelect;

/**
 * The shape used to derive the payload type. `where` narrows rows, not the
 * type, so the runtime include below can add filters without diverging.
 */
const SUBJECT_INCLUDE_SHAPE = {
  _count: { select: { teachingAssignments: true } },
  teachingAssignments: { select: TEACHING_ASSIGNMENT_SELECT },
} satisfies Prisma.SubjectInclude;

export type SubjectWithTeachers = Prisma.SubjectGetPayload<{
  include: typeof SUBJECT_INCLUDE_SHAPE;
}>;

/**
 * A teaching assignment is scoped to one (classroom, semester) pair, so a
 * subject can be taught by different teachers in different classes. The list
 * therefore shows only the active semester's assignments — reading across
 * every year would mix cohorts and show teachers who no longer teach it.
 *
 * When no semester is active the relation is left empty rather than falling
 * back to "all semesters", so the column under-reports instead of lying.
 */
export function buildSubjectInclude(activeSemesterId: string | null) {
  const assignmentWhere: Prisma.TeachingAssignmentWhereInput = {
    deletedAt: null,
    // `in: []` matches nothing — the explicit way to say "no active semester,
    // so there is nothing to show" without inventing a sentinel id.
    semesterId: activeSemesterId ? { equals: activeSemesterId } : { in: [] },
  };

  return {
    _count: { select: { teachingAssignments: { where: assignmentWhere } } },
    teachingAssignments: {
      where: assignmentWhere,
      select: TEACHING_ASSIGNMENT_SELECT,
      orderBy: { classroom: { name: 'asc' } },
    },
  } satisfies Prisma.SubjectInclude;
}
