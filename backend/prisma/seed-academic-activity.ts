import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import { pgSslOptions } from '../src/core/database/pg-ssl.js';
import {
  seedAchievements,
  seedAssessments,
  seedGuardians,
  seedMarksAndAttendance,
  seedReportCards,
} from './seeds/modules/academic-activity.seed.js';

/**
 * A term's worth of teaching, over the people the school already has.
 *
 * Tasks and their weightings, marks, the register, the rapor, guardians and
 * achievements — all against existing students, staff, classes and teaching
 * assignments. **It creates no people.** That is what lets it run on a box
 * holding a real school, where `seed:academic-demo` cannot: that one invents
 * children.
 *
 *   pnpm --filter backend seed:academic-activity
 *
 * Run `seed:timetable` first if the term has no teaching assignments yet, and
 * `seed:school-life` first if you want the holidays honoured — the register
 * skips days the school was shut, and it can only skip the ones recorded.
 *
 * Every figure is deterministic: the same student gets the same marks on every
 * run, so a screenshot taken today still matches the database tomorrow.
 */
const connectionString = process.env.DATABASE_URL ?? '';
const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString,
    ...pgSslOptions(connectionString),
  }),
});

async function main() {
  console.log('\n=== Academic activity ===\n');

  const semester = await prisma.semester.findFirst({
    where: { isActive: true, deletedAt: null },
    include: { academicYear: { select: { name: true, startYear: true } } },
  });
  if (!semester) throw new Error('No active semester on this box.');

  const [students, teachers, assignments] = await Promise.all([
    prisma.student.count({ where: { deletedAt: null } }),
    prisma.teacher.count({ where: { deletedAt: null } }),
    prisma.teachingAssignment.count({
      where: { deletedAt: null, semesterId: semester.id },
    }),
  ]);

  console.log(
    `  ${semester.academicYear.name}: ${students} siswa, ${teachers} guru, ` +
      `${assignments} penugasan mengajar\n`,
  );

  if (assignments === 0) {
    throw new Error(
      'No teaching assignments this term — run seed:timetable first.',
    );
  }

  const scope = { semesterId: semester.id };

  await seedAssessments(prisma, scope);
  await seedMarksAndAttendance(prisma, scope);
  await seedReportCards(prisma, scope);
  await seedGuardians(prisma);
  await seedAchievements(prisma, semester.academicYear.startYear);

  const after = await prisma.student.count({ where: { deletedAt: null } });
  console.log(
    `\n  siswa sebelum ${students}, sesudah ${after}` +
      (after === students ? ' — tidak ada yang ditambah' : ' — BERUBAH!'),
  );
  console.log('');
}

main()
  .catch((e) => {
    console.error('\n✗ Academic activity seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
