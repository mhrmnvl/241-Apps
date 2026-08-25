import { Day, PrismaClient } from '@prisma/client';

/**
 * The school's week, built as one thing rather than one subject at a time.
 *
 * Kept apart from the demo fixture that calls it for two reasons: a timetable
 * is worth re-laying on its own — the fixture around it takes a quarter of an
 * hour against a hosted database, and nobody re-marks nine thousand papers to
 * move a lesson — and the placement rules are the only part of that fixture
 * with a decision in them worth reading.
 *
 * `pnpm --filter backend seed:timetable` runs it alone.
 */

const TEACHING_DAYS: Day[] = [
  Day.MONDAY,
  Day.TUESDAY,
  Day.WEDNESDAY,
  Day.THURSDAY,
  Day.FRIDAY,
  Day.SATURDAY,
];

/** One period of the school day, as the timetable needs to see it. */
export interface TimetablePeriod {
  id: string;
  /** Minutes since midnight, so two periods can be compared for overlap. */
  startMinutes: number;
  endMinutes: number;
  isLesson: boolean;
  /** The days this period exists on. Empty means every day. */
  days: Day[];
}

const happensOn = (period: TimetablePeriod, day: Day) =>
  period.days.length === 0 || period.days.includes(day);

const overlaps = (a: TimetablePeriod, b: TimetablePeriod) =>
  a.startMinutes < b.endMinutes && b.startMinutes < a.endMinutes;

/**
 * Which lesson periods are not free, day by day.
 *
 * The flag ceremony runs 07.30 to 08.30 on a Monday, which is Jam Ke-1 and Jam
 * Ke-2 exactly. Nothing was stopping the timetable from teaching Matematika
 * then: the builder only knew which periods were lessons, not which of them
 * the school had already spent. The result was a Monday that showed a ceremony
 * and two lessons at the same hour.
 *
 * Any non-lesson period blocks the lesson periods it overlaps, on the days it
 * happens. The breaks fall between periods rather than across them, so in
 * practice this blocks the ceremony's two and nothing else — but it is the
 * clash that is being described here, not the ceremony.
 */
export function blockedLessonPeriods(
  periods: TimetablePeriod[],
  days: Day[],
): Map<Day, Set<string>> {
  const lessons = periods.filter((p) => p.isLesson);
  const interruptions = periods.filter((p) => !p.isLesson);

  return new Map(
    days.map((day) => [
      day,
      new Set(
        lessons
          .filter(
            (lesson) =>
              happensOn(lesson, day) &&
              interruptions.some(
                (other) => happensOn(other, day) && overlaps(lesson, other),
              ),
          )
          .map((lesson) => lesson.id),
      ),
    ]),
  );
}

export interface TimetableRow {
  assignmentId: string;
  day: Day;
  timeSlotId: string;
}

export interface ClassTimetableInput {
  classroomId: string;
  /** Every subject taught to this class this term, and who teaches it. */
  assignments: { id: string; teacherId: string }[];
}

/**
 * A week of lessons for every class, laid out so that it could really be run.
 *
 * This used to be decided one subject at a time — day `s % 6`, period
 * `(classIndex + s) % slots` — which is fine for one class and wrong for a
 * school: two classes reached the same teacher in the same period, and nothing
 * noticed, because each row was written without looking at the others. On a
 * screen that is a timetable a school could not follow, in the one demo where
 * somebody is likely to read it closely.
 *
 * So the whole week is placed at once, against three rules:
 *
 *   - a class sits in one lesson at a time;
 *   - a teacher stands in one classroom at a time;
 *   - a subject is not taught to the same class twice in one day.
 *
 * Every free period is filled. There is no quota per subject: the week has as
 * many lessons in it as it has periods, minus the ones the school has already
 * spent, and a school day with gaps in the middle of it is not what a
 * timetable looks like. Which subject fills a period is whichever has been
 * taught least so far, so the load spreads evenly rather than front-loading
 * the alphabet.
 *
 * The placement is greedy and deterministic — the assignment id breaks every
 * tie, so two runs produce the same week. Greedy can leave a period empty when
 * every subject's teacher is busy elsewhere in it; with two dozen subjects
 * against six classes that is rare, and an empty period is the honest outcome
 * rather than a teacher in two rooms.
 */
export function buildTimetable(
  classes: ClassTimetableInput[],
  days: Day[],
  lessonSlotIds: string[],
  blockedByDay = new Map<Day, Set<string>>(),
): TimetableRow[] {
  const rows: TimetableRow[] = [];
  const teacherBusy = new Set<string>();
  const busyKey = (teacherId: string, day: Day, slotId: string) =>
    `${teacherId}|${day}|${slotId}`;

  for (const cls of classes) {
    // How often each subject has been taught to this class so far. The week
    // is filled, so this decides the order rather than a remaining quota.
    const taught = new Map(cls.assignments.map((a) => [a.id, 0]));
    const teacherOf = new Map(cls.assignments.map((a) => [a.id, a.teacherId]));
    const placedToday = new Map<Day, Set<string>>(
      days.map((d) => [d, new Set()]),
    );

    // Period by period *across* the week, not day by day through it. It made
    // the difference when the week was only partly filled — day-first put ten
    // lessons on Monday and nothing after Wednesday — and it still spreads a
    // subject across the days rather than stacking it into one.
    for (const slotId of lessonSlotIds) {
      for (const day of days) {
        // A period the school has already spent — the Monday ceremony sits on
        // Jam Ke-1 and Jam Ke-2 — is not a period to teach in.
        if (blockedByDay.get(day)?.has(slotId)) continue;

        const today = placedToday.get(day)!;

        // Least taught first, and the assignment id breaks a tie so that two
        // runs of this fixture produce the same timetable.
        const candidate = [...taught.entries()]
          .filter(([id]) => !today.has(id))
          .filter(
            ([id]) =>
              !teacherBusy.has(busyKey(teacherOf.get(id)!, day, slotId)),
          )
          .sort((a, b) => a[1] - b[1] || a[0].localeCompare(b[0]))[0];

        if (!candidate) continue;

        const [assignmentId] = candidate;
        rows.push({ assignmentId, day, timeSlotId: slotId });
        taught.set(assignmentId, taught.get(assignmentId)! + 1);
        today.add(assignmentId);
        teacherBusy.add(busyKey(teacherOf.get(assignmentId)!, day, slotId));
      }
    }
  }

  return rows;
}

/**
 * The timetable, written for every class the school actually teaches.
 *
 * Read back from the database rather than taken from what this run created: a
 * class holds subjects from the base seed as well as this fixture's, and a
 * timetable that shows only half of them is not the class's timetable.
 */
export async function seedTimetable(
  prisma: PrismaClient,
  semesterId: string,
  classrooms: { id: string; code: string }[],
  periods: TimetablePeriod[],
) {
  const lessonSlotIds = periods.filter((p) => p.isLesson).map((p) => p.id);
  if (lessonSlotIds.length === 0) {
    console.log('  no lesson periods to timetable on, skipping');
    return;
  }

  const blockedByDay = blockedLessonPeriods(periods, TEACHING_DAYS);

  const assignments = await prisma.teachingAssignment.findMany({
    where: {
      deletedAt: null,
      semesterId,
      classroomId: { in: classrooms.map((c) => c.id) },
    },
    select: { id: true, teacherId: true, classroomId: true },
    orderBy: { id: 'asc' },
  });

  const rows = buildTimetable(
    classrooms.map((classroom) => ({
      classroomId: classroom.id,
      assignments: assignments
        .filter((a) => a.classroomId === classroom.id)
        .map((a) => ({ id: a.id, teacherId: a.teacherId })),
    })),
    TEACHING_DAYS,
    lessonSlotIds,
    blockedByDay,
  );

  const roomOf = new Map(classrooms.map((c) => [c.id, c.code]));
  const classroomOf = new Map(assignments.map((a) => [a.id, a.classroomId]));

  // Replaced whole, not added to. Creating only what is missing is idempotent
  // until the rule that places a lesson changes, and then it is not — the last
  // version left its rows behind beside the new ones and every subject
  // appeared twice.
  await prisma.$transaction([
    prisma.schedule.deleteMany({
      where: { teachingAssignmentId: { in: assignments.map((a) => a.id) } },
    }),
    prisma.schedule.createMany({
      data: rows.map((row) => ({
        teachingAssignmentId: row.assignmentId,
        timeSlotId: row.timeSlotId,
        day: row.day,
        room: roomOf.get(classroomOf.get(row.assignmentId)!) ?? '-',
      })),
    }),
  ]);

  const freePerClass = TEACHING_DAYS.reduce(
    (n, day) =>
      n + lessonSlotIds.filter((id) => !blockedByDay.get(day)?.has(id)).length,
    0,
  );
  const capacity = freePerClass * classrooms.length;
  console.log(
    `  ${rows.length} of ${capacity} periods filled — ${assignments.length} ` +
      `subjects across ${classrooms.length} classes, ` +
      `${freePerClass} teaching periods a week each`,
  );
  if (rows.length < capacity) {
    console.log(
      `  ${capacity - rows.length} left empty: no subject whose teacher was free`,
    );
  }
}
