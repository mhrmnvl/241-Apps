import { Prisma } from '@prisma/client';
import { buildSubjectInclude } from './prisma-subject.includes.js';

describe('buildSubjectInclude', () => {
  const SEMESTER_ID = 'sem-1';

  /** The path the subject table's "Guru Pengampu" column reads. */
  function teacherSelect(include: Prisma.SubjectInclude) {
    const assignments =
      include.teachingAssignments as Prisma.Subject$teachingAssignmentsArgs;
    return assignments.select;
  }

  it('loads the teachingAssignments relation, not just its count', () => {
    const include = buildSubjectInclude(SEMESTER_ID);

    // Regression: the include used to carry only `_count`, so the column
    // could never render a teacher no matter what the database held.
    expect(include.teachingAssignments).toBeDefined();
    expect(include._count).toBeDefined();
  });

  it('selects enough to render a teacher name with a NIP fallback', () => {
    const select = teacherSelect(buildSubjectInclude(SEMESTER_ID));

    expect(select).toMatchObject({
      teacherId: true,
      teacher: {
        select: {
          nip: true,
          user: { select: { profile: { select: { name: true } } } },
        },
      },
    });
  });

  it('names the classroom, since a subject can differ per class', () => {
    const select = teacherSelect(buildSubjectInclude(SEMESTER_ID));

    expect(select).toMatchObject({
      classroom: { select: { id: true, name: true } },
    });
  });

  it('scopes assignments to the active semester and skips deleted rows', () => {
    const include = buildSubjectInclude(SEMESTER_ID);
    const assignments =
      include.teachingAssignments as Prisma.Subject$teachingAssignmentsArgs;

    expect(assignments.where).toEqual({
      deletedAt: null,
      semesterId: { equals: SEMESTER_ID },
    });
  });

  it('matches nothing when no semester is active', () => {
    const include = buildSubjectInclude(null);
    const assignments =
      include.teachingAssignments as Prisma.Subject$teachingAssignmentsArgs;

    // `in: []` under-reports rather than silently showing every semester.
    expect(assignments.where).toEqual({
      deletedAt: null,
      semesterId: { in: [] },
    });
  });

  it('counts only the assignments it shows', () => {
    const include = buildSubjectInclude(SEMESTER_ID);
    const count = include._count as Prisma.SubjectCountOutputTypeDefaultArgs;
    const assignments =
      include.teachingAssignments as Prisma.Subject$teachingAssignmentsArgs;

    expect(count.select?.teachingAssignments).toEqual({
      where: assignments.where,
    });
  });
});
