import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import { pgSslOptions } from '../src/core/database/pg-ssl.js';
import { Day } from '@prisma/client';
import { seedTeachingPlan } from './seeds/modules/teaching-plan.seed.js';
import {
  seedTimetable,
  type TimetablePeriod,
} from './seeds/modules/timetable.seed.js';

/**
 * A stored period, as the builder needs it.
 *
 * `@db.Time(0)` comes back as a Date on 1970-01-01, so the clock is read off
 * it in UTC — the same way every other reader of these columns does.
 */
function toPeriod(slot: {
  id: string;
  startTime: Date;
  endTime: Date;
  type: { isLesson: boolean; days: Day[] };
}): TimetablePeriod {
  const minutes = (d: Date) => d.getUTCHours() * 60 + d.getUTCMinutes();
  return {
    id: slot.id,
    startMinutes: minutes(slot.startTime),
    endMinutes: minutes(slot.endTime),
    isLesson: slot.type.isLesson,
    days: slot.type.days,
  };
}

/**
 * Lay the week's lessons out again, and nothing else.
 *
 * The demo fixture builds the timetable too, but it re-marks nine thousand
 * papers on the way past and takes a quarter of an hour against a hosted
 * database. Moving a lesson should not cost that, so this runs the one step.
 *
 *   pnpm --filter backend seed:timetable
 *
 * Every existing lesson for the active term is replaced. What decides where
 * they land — one class per period, one classroom per teacher, one lesson per
 * subject per day — lives in `seeds/modules/timetable.seed.ts`.
 */
const connectionString = process.env.DATABASE_URL ?? '';
const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString,
    ...pgSslOptions(connectionString),
  }),
});

async function main() {
  const semester = await prisma.semester.findFirst({
    where: { isActive: true, deletedAt: null },
    select: { id: true, academicYearId: true },
  });
  if (!semester) throw new Error('No active semester on this box.');

  // This term's classrooms only. Next year's are copies made ahead of a
  // promotion, and they have no term to be taught in yet.
  const classrooms = await prisma.classroom.findMany({
    where: {
      deletedAt: null,
      academicYearId: semester.academicYearId,
    },
    select: { id: true, code: true },
    orderBy: { code: 'asc' },
  });
  if (classrooms.length === 0) {
    throw new Error('No classrooms in the active academic year on this box.');
  }

  // Every period, not just the teaching ones: the ceremony and the breaks are
  // what say which teaching periods are already spoken for.
  const slots = await prisma.timeSlot.findMany({
    where: { deletedAt: null },
    select: {
      id: true,
      startTime: true,
      endTime: true,
      type: { select: { isLesson: true, days: true } },
    },
    orderBy: { order: 'asc' },
  });

  console.log('\n=== Teaching plan ===\n');
  await seedTeachingPlan(prisma, semester.id, classrooms);

  console.log('\n=== Timetable ===\n');
  await seedTimetable(prisma, semester.id, classrooms, slots.map(toPeriod));
  console.log('');
}

main()
  .catch((e) => {
    console.error('\n✗ Timetable failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
