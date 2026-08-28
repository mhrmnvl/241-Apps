import { PrismaClient } from '@prisma/client';

/**
 * Who teaches what, decided once for the whole school.
 *
 * The rule the school asked for is "one teacher, one subject": a teacher takes
 * their subject to every class that studies it, rather than a class's twelve
 * subjects being spread across whoever happened to be free. That is how a
 * madrasah actually staffs a timetable, and it is what makes a teacher's own
 * schedule readable — the same subject, six classes, one person.
 *
 * Two things follow that are worth stating, because they look like exceptions
 * and are not:
 *
 *   - Every teacher must end up with something. There are more teachers than
 *     subjects, so the ones left over share a subject with its owner, taking
 *     some of its classes. Each of them still teaches exactly one subject.
 *   - Every class studies every subject. Anything less leaves holes in the
 *     week, and the week is meant to be full.
 */

export interface PlanInput {
  /** Ordered — the order decides who gets what, so it must be stable. */
  classroomIds: string[];
  subjectIds: string[];
  teacherIds: string[];
}

/** `${classroomId}|${subjectId}` → the teacher who takes it. */
export type TeachingPlan = Map<string, string>;

export const planKey = (classroomId: string, subjectId: string) =>
  `${classroomId}|${subjectId}`;

/**
 * The plan, as a pure function of three ordered lists.
 *
 * Subject *i* belongs to teacher *i*. Teachers past the end of the subject
 * list wrap back round and share: with twenty-four teachers and twenty-three
 * subjects, the twenty-fourth joins the first subject and takes every other
 * class of it. Nobody teaches two subjects, and nobody is left with none.
 */
export function planTeaching({
  classroomIds,
  subjectIds,
  teacherIds,
}: PlanInput): TeachingPlan {
  const plan: TeachingPlan = new Map();
  if (subjectIds.length === 0 || teacherIds.length === 0) return plan;

  // Who shares each subject, owner first.
  const staffOf = new Map<string, string[]>(subjectIds.map((id) => [id, []]));
  for (const [index, teacherId] of teacherIds.entries()) {
    const subjectId = subjectIds[index % subjectIds.length];
    staffOf.get(subjectId)!.push(teacherId);
  }

  for (const subjectId of subjectIds) {
    const staff = staffOf.get(subjectId)!;
    if (staff.length === 0) continue;

    for (const [index, classroomId] of classroomIds.entries()) {
      plan.set(planKey(classroomId, subjectId), staff[index % staff.length]);
    }
  }

  return plan;
}

/**
 * Write the plan, keeping every assignment that already exists.
 *
 * Reassigned rather than rebuilt, because a teaching assignment is what tasks
 * and marks hang off: deleting one to create the same pairing under a
 * different teacher would take nine thousand marks with it. So an existing
 * row has its teacher corrected in place, and only the pairings nobody has
 * recorded yet are created.
 */
export async function seedTeachingPlan(
  prisma: PrismaClient,
  semesterId: string,
  classrooms: { id: string; code: string }[],
) {
  const [subjects, teachers] = await Promise.all([
    prisma.subject.findMany({
      where: { deletedAt: null },
      select: { id: true },
      orderBy: { code: 'asc' },
    }),
    prisma.teacher.findMany({
      where: { deletedAt: null },
      select: { id: true },
      orderBy: { nip: 'asc' },
    }),
  ]);

  if (subjects.length === 0 || teachers.length === 0) {
    console.log('  no subjects or teachers on this box, skipping the plan');
    return;
  }

  const plan = planTeaching({
    classroomIds: classrooms.map((c) => c.id),
    subjectIds: subjects.map((s) => s.id),
    teacherIds: teachers.map((t) => t.id),
  });

  const existing = await prisma.teachingAssignment.findMany({
    where: {
      deletedAt: null,
      semesterId,
      classroomId: { in: classrooms.map((c) => c.id) },
    },
    select: {
      id: true,
      classroomId: true,
      subjectId: true,
      teacherId: true,
      _count: { select: { assessmentItems: true } },
    },
  });

  // Two teachers for one class's subject, collapsed to one.
  //
  // The database allows it — its unique key is
  // `(teacher, classroom, subject, semester)`, so the same subject twice under
  // different teachers is a legal pair of rows — and successive seeds left
  // twelve of them. Under "one teacher, one subject" they are not a second
  // teacher, they are a leftover, and while they stand the school has ten
  // teachers holding two subjects each.
  //
  // The one kept is the planned owner's if either row is theirs, then whichever
  // carries the most tasks, then the lower id so the choice is stable. The
  // other is soft-deleted with its lessons: retired, not erased, so whatever
  // was recorded against it can still be recovered.
  const byPair = new Map<string, typeof existing>();
  for (const row of existing) {
    const key = planKey(row.classroomId, row.subjectId);
    byPair.set(key, [...(byPair.get(key) ?? []), row]);
  }

  let retired = 0;
  const existingBy = new Map<string, (typeof existing)[number]>();

  for (const [key, rows] of byPair) {
    const owner = plan.get(key);
    const ranked = [...rows].sort(
      (a, b) =>
        Number(b.teacherId === owner) - Number(a.teacherId === owner) ||
        b._count.assessmentItems - a._count.assessmentItems ||
        a.id.localeCompare(b.id),
    );

    const [keep, ...extras] = ranked;
    existingBy.set(key, keep);

    for (const extra of extras) {
      await prisma.$transaction([
        prisma.schedule.updateMany({
          where: { teachingAssignmentId: extra.id, deletedAt: null },
          data: { deletedAt: new Date() },
        }),
        prisma.teachingAssignment.update({
          where: { id: extra.id },
          data: { deletedAt: new Date() },
        }),
      ]);
      retired++;
    }
  }

  let reassigned = 0;
  let created = 0;

  for (const [key, teacherId] of plan) {
    const row = existingBy.get(key);

    if (row) {
      if (row.teacherId !== teacherId) {
        await prisma.teachingAssignment.update({
          where: { id: row.id },
          data: { teacherId },
        });
        reassigned++;
      }
      continue;
    }

    const [classroomId, subjectId] = key.split('|');

    // A pairing may exist soft-deleted — reviving it keeps whatever hangs off
    // it, and avoids tripping the partial unique index.
    const buried = await prisma.teachingAssignment.findFirst({
      where: {
        classroomId,
        subjectId,
        semesterId,
        deletedAt: { not: null },
      },
      select: { id: true },
    });

    if (buried) {
      await prisma.teachingAssignment.update({
        where: { id: buried.id },
        data: { teacherId, deletedAt: null },
      });
    } else {
      await prisma.teachingAssignment.create({
        data: { classroomId, subjectId, semesterId, teacherId },
      });
    }
    created++;
  }

  const staffed = new Set(plan.values()).size;
  console.log(
    `  ${plan.size} pairings planned — ${created} created, ` +
      `${reassigned} reassigned, ${retired} duplicates retired`,
  );
  console.log(
    `  ${staffed} of ${teachers.length} teachers hold teaching, ` +
      `${subjects.length} subjects across ${classrooms.length} classes`,
  );
}
