import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import { pgSslOptions } from '../src/core/database/pg-ssl.js';
import { seedAcademicCalendarTypes } from './seeds/modules/academic-calendar-type.seed.js';
import { seedAchievementTypes } from './seeds/modules/achievement-type.seed.js';
import { seedEducations } from './seeds/modules/education.seed.js';
import { seedOccupations } from './seeds/modules/occupation.seed.js';
import { seedAcademicCalendar } from './seeds/modules/academic-calendar.seed.js';
import {
  seedAnnouncements,
  seedNonWorkingDays,
} from './seeds/modules/school-life.seed.js';

/**
 * The school year around the teaching: the calendar, the noticeboard, and the
 * days the school is shut.
 *
 * Safe on a box holding real people. Nothing here creates or edits a student,
 * a teacher, a class or an enrolment — it reads the active academic year and
 * the classes that already exist, and writes calendar entries, announcements
 * and holidays against them. That is the whole reason it is not part of
 * `seed:academic-demo`, which invents children.
 *
 *   pnpm --filter backend seed:school-life
 *
 * Idempotent throughout: entries are keyed by title or date, so running it
 * twice leaves the same calendar rather than two of everything.
 */
const connectionString = process.env.DATABASE_URL ?? '';
const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString,
    ...pgSslOptions(connectionString),
  }),
});

async function main() {
  console.log('\n=== School life ===\n');

  const academicYear = await prisma.academicYear.findFirst({
    where: { isActive: true, deletedAt: null },
    select: { id: true, name: true, startYear: true },
  });
  if (!academicYear) throw new Error('No active academic year on this box.');

  const semesters = await prisma.semester.findMany({
    where: { academicYearId: academicYear.id, deletedAt: null },
    select: { id: true, type: { select: { name: true } } },
  });

  const classrooms = await prisma.classroom.findMany({
    where: { deletedAt: null, academicYearId: academicYear.id },
    select: { id: true, code: true },
    orderBy: { code: 'asc' },
  });

  console.log(
    `  ${academicYear.name}: ${semesters.length} semester, ${classrooms.length} kelas\n`,
  );

  // Reference lists the activity seed needs before it can record a guardian's
  // job or the kind of a prize. Without them those two steps skip themselves,
  // which is how a school ends up with a full rapor and an empty Data Orang
  // Tua. All three are lists of words — no person is created by any of them.
  await seedOccupations(prisma);
  await seedEducations(prisma);
  await seedAchievementTypes(prisma);

  await seedAcademicCalendarTypes(prisma);
  await seedAcademicCalendar(
    prisma,
    academicYear.id,
    semesters.map((s) => ({ id: s.id, typeName: s.type.name })),
    academicYear.startYear,
  );
  await seedNonWorkingDays(prisma, academicYear.startYear);
  await seedAnnouncements(prisma, classrooms);

  console.log('');
}

main()
  .catch((e) => {
    console.error('\n✗ School life seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
