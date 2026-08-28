import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import { pgSslOptions } from '../src/core/database/pg-ssl.js';

/**
 * Take the seeded data back out.
 *
 * Production never runs a seed, so it should never need this — which is
 * exactly why it refuses to run there at all. Its purpose is a development box
 * that has been filled for a demonstration and needs emptying again.
 *
 *   pnpm --filter backend seed:clear-dummy              # the fixtures only
 *   pnpm --filter backend seed:clear-dummy --activity   # and the term's work
 *
 * **Two tiers, because only one of them is reversible in any meaningful
 * sense.**
 *
 * The first tier removes rows whose shape the seeds own: announcements by the
 * titles they were posted under, calendar entries by theirs, holidays by date,
 * guardians by the NIK range the fixture invents in, achievements by name.
 * Nothing a person typed matches those, so nothing a person typed is lost.
 *
 * The second tier is different and is not the default. Marks, attendance,
 * tasks and rapor hang off real students, and there is no marker separating a
 * seeded mark from one a teacher entered — the row looks the same either way.
 * Clearing them is therefore clearing the term's academic record, all of it,
 * for every child. It is behind `--activity` and it says so before it starts.
 */
const connectionString = process.env.DATABASE_URL ?? '';
const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString,
    ...pgSslOptions(connectionString),
  }),
});

/** Titles the seeds post under. Anything else on the board is somebody's. */
const SEEDED_ANNOUNCEMENTS = [
  'Pembagian Rapor Semester Ganjil',
  'Libur Hari Guru Nasional',
  'Jadwal Penilaian Akhir Semester',
  'Pembayaran SPP Bulan Berjalan',
  'Persiapan Ujian Akhir Kelas IX',
  'Kegiatan Tahfidz Kelas VII',
];

const SEEDED_CALENDAR_TITLES = [
  'Awal Semester Ganjil',
  'Masa Taaruf Siswa Madrasah',
  'Hari Kemerdekaan Republik Indonesia',
  'Ujian Tengah Semester Ganjil',
  'Peringatan Hari Guru Nasional',
  'Ujian Akhir Semester Ganjil',
  'Pembagian Rapor Semester Ganjil',
  'Libur Semester Ganjil',
  'Awal Semester Genap',
  'Ujian Tengah Semester Genap',
  'Ujian Akhir Madrasah Kelas IX',
  'Ujian Akhir Semester Genap',
  'Pendaftaran Peserta Didik Baru',
  'Libur Akhir Tahun Ajaran',
];

const SEEDED_HOLIDAYS = [
  'Hari Kemerdekaan Republik Indonesia',
  'Hari Raya Natal',
  'Tahun Baru Masehi',
  'Hari Buruh Internasional',
  'Hari Lahir Pancasila',
];

const SEEDED_ACHIEVEMENTS = [
  "Juara 1 Musabaqah Tilawatil Qur'an",
  'Juara 2 Olimpiade Matematika',
  'Juara 1 Pidato Bahasa Arab',
  'Juara 3 Lomba Cerdas Cermat',
  'Juara 1 Futsal Antar Madrasah',
  'Juara 2 Kaligrafi',
  'Juara Harapan 1 Tahfidz 5 Juz',
  'Juara 3 Lomba Pramuka',
];

/** The NIK ranges the guardian fixture invents in. */
const SEEDED_PARENT_NIK_PREFIXES = ['3573060101', '3573064102'];

function refuseOnProduction() {
  if (/apps241_prod|_prod\?|_prod\b/.test(connectionString)) {
    throw new Error(
      'This deletes seeded data and will not run against production. ' +
        'Production is populated through the UI and never seeded, so there is ' +
        'nothing here for it to remove — only things to lose.',
    );
  }
}

async function clearFixtures() {
  const parents = await prisma.parent.findMany({
    where: {
      OR: SEEDED_PARENT_NIK_PREFIXES.map((prefix) => ({
        nik: { startsWith: prefix },
      })),
    },
    select: { id: true },
  });
  const parentIds = parents.map((p) => p.id);

  const [links, addresses, achievements, announcements, calendar, holidays] =
    await prisma.$transaction([
      prisma.studentParent.deleteMany({
        where: { parentId: { in: parentIds } },
      }),
      // Addresses hang off a parent by a plain foreign key.
      prisma.address.deleteMany({ where: { parentId: { in: parentIds } } }),
      prisma.achievement.deleteMany({
        where: { name: { in: SEEDED_ACHIEVEMENTS } },
      }),
      prisma.announcement.deleteMany({
        where: { title: { in: SEEDED_ANNOUNCEMENTS } },
      }),
      prisma.academicCalendar.deleteMany({
        where: { title: { in: SEEDED_CALENDAR_TITLES } },
      }),
      prisma.nonWorkingDay.deleteMany({
        where: { name: { in: SEEDED_HOLIDAYS } },
      }),
    ]);

  // After the links and addresses are gone, the parents themselves can go.
  const gone = await prisma.parent.deleteMany({
    where: { id: { in: parentIds } },
  });

  console.log('  Fixtures removed:');
  console.log(`    ${gone.count} guardians, ${links.count} relations`);
  console.log(`    ${achievements.count} achievements`);
  console.log(`    ${announcements.count} announcements`);
  console.log(
    `    ${calendar.count} calendar entries, ${holidays.count} holidays`,
  );
  if (addresses.count > 0) {
    console.log(`    ${addresses.count} guardian addresses`);
  }
}

async function clearActivity() {
  const semester = await prisma.semester.findFirst({
    where: { isActive: true, deletedAt: null },
    select: { id: true },
  });
  if (!semester) {
    console.log('  No active semester — nothing to clear.');
    return;
  }

  const enrolments = await prisma.studentEnrollment.findMany({
    where: { semesterId: semester.id },
    select: { id: true },
  });
  const enrolmentIds = enrolments.map((e) => e.id);

  const cards = await prisma.reportCard.findMany({
    where: { enrollmentId: { in: enrolmentIds } },
    select: { id: true },
  });

  const removed = await prisma.$transaction(async (tx) => {
    const lines = await tx.reportCardSubject.deleteMany({
      where: { reportCardId: { in: cards.map((c) => c.id) } },
    });
    const reportCards = await tx.reportCard.deleteMany({
      where: { enrollmentId: { in: enrolmentIds } },
    });
    const scores = await tx.studentScore.deleteMany({
      where: { enrollmentId: { in: enrolmentIds } },
    });
    const attendance = await tx.attendance.deleteMany({
      where: { enrollmentId: { in: enrolmentIds } },
    });
    const items = await tx.assessmentItem.deleteMany({
      where: { teachingAssignment: { semesterId: semester.id } },
    });
    const weights = await tx.assessmentWeight.deleteMany({
      where: { teachingAssignment: { semesterId: semester.id } },
    });
    return {
      lines: lines.count,
      reportCards: reportCards.count,
      scores: scores.count,
      attendance: attendance.count,
      items: items.count,
      weights: weights.count,
    };
  });

  console.log("  The term's academic record removed:");
  console.log(`    ${removed.items} tasks, ${removed.weights} weightings`);
  console.log(
    `    ${removed.scores} marks, ${removed.attendance} attendance records`,
  );
  console.log(
    `    ${removed.reportCards} report cards, ${removed.lines} subject lines`,
  );
}

async function main() {
  refuseOnProduction();

  const withActivity = process.argv.includes('--activity');

  console.log('\n=== Clearing seeded data ===\n');

  const [students, teachers] = await Promise.all([
    prisma.student.count({ where: { deletedAt: null } }),
    prisma.teacher.count({ where: { deletedAt: null } }),
  ]);

  if (withActivity) {
    console.log(
      '  --activity: this removes every mark, register entry and rapor of the\n' +
        '  active term, for every student. A seeded mark and one a teacher typed\n' +
        '  are the same row; there is no way to remove only the first.\n',
    );
  }

  await clearFixtures();
  if (withActivity) await clearActivity();

  const [studentsAfter, teachersAfter] = await Promise.all([
    prisma.student.count({ where: { deletedAt: null } }),
    prisma.teacher.count({ where: { deletedAt: null } }),
  ]);

  console.log(
    `\n  siswa ${students} -> ${studentsAfter}, guru ${teachers} -> ${teachersAfter}` +
      (students === studentsAfter && teachers === teachersAfter
        ? ' — tidak ada yang dihapus'
        : ' — BERUBAH!'),
  );
  console.log('');
}

main()
  .catch((e) => {
    console.error(
      '\n✗ Clear failed:',
      e instanceof Error ? e.message : String(e),
    );
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
