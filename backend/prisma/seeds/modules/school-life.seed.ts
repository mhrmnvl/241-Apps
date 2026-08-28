import { PrismaClient } from '@prisma/client';

/**
 * The things around the teaching: the noticeboard and the days the school is
 * shut.
 *
 * Kept apart from the demo fixture that also calls them because neither
 * invents a person. A school with real students and real staff still needs its
 * announcements and its holidays, and `seed:academic-demo` cannot be run there
 * — it makes up children.
 *
 * `pnpm --filter backend seed:school-life` runs these alone.
 */

/**
 * The school's noticeboard.
 *
 * The table was empty, and the menu entry is one of the few every role can
 * open — a teacher, a student and an administrator all land on it. An empty
 * noticeboard is the one screen that cannot be told apart from a broken one.
 *
 * A few are addressed to particular classes, because that is the part of the
 * feature nothing else demonstrates: the rest of the school does not see them.
 */
const ANNOUNCEMENTS: {
  title: string;
  description: string;
  daysAgo: number;
  /** Class codes, or empty for the whole school. */
  classes: string[];
}[] = [
  {
    title: 'Pembagian Rapor Semester Ganjil',
    description:
      'Pembagian rapor semester ganjil dilaksanakan pada hari Sabtu pukul 08.00 WIB di ruang kelas masing-masing. Rapor diambil oleh orang tua atau wali murid.',
    daysAgo: 3,
    classes: [],
  },
  {
    title: 'Libur Hari Guru Nasional',
    description:
      'Sehubungan dengan peringatan Hari Guru Nasional, kegiatan belajar mengajar diliburkan. Peserta didik mengikuti upacara peringatan di lapangan sekolah.',
    daysAgo: 9,
    classes: [],
  },
  {
    title: 'Jadwal Penilaian Akhir Semester',
    description:
      'Penilaian Akhir Semester berlangsung selama dua pekan. Jadwal lengkap per mata pelajaran dapat dilihat pada menu Jadwal Pelajaran.',
    daysAgo: 14,
    classes: [],
  },
  {
    title: 'Pembayaran SPP Bulan Berjalan',
    description:
      'Pembayaran SPP paling lambat tanggal 10 setiap bulan melalui bendahara sekolah pada jam kerja.',
    daysAgo: 20,
    classes: [],
  },
  {
    title: 'Persiapan Ujian Akhir Kelas IX',
    description:
      'Peserta didik kelas IX mengikuti bimbingan belajar tambahan setiap hari Selasa dan Kamis sepulang sekolah.',
    daysAgo: 6,
    classes: ['IX-A', 'IX-B'],
  },
  {
    title: 'Kegiatan Tahfidz Kelas VII',
    description:
      'Setoran hafalan pekan ini dimajukan menjadi hari Rabu. Peserta didik membawa buku setoran masing-masing.',
    daysAgo: 2,
    classes: ['VII-A', 'VII-B'],
  },
];

export async function seedAnnouncements(
  prisma: PrismaClient,
  classrooms: { id: string; code: string }[],
) {
  const idOf = new Map(classrooms.map((c) => [c.code, c.id]));
  let created = 0;

  for (const spec of ANNOUNCEMENTS) {
    const date = new Date();
    date.setUTCHours(0, 0, 0, 0);
    date.setUTCDate(date.getUTCDate() - spec.daysAgo);

    // Keyed by title: a fixture that appended would leave six more of these on
    // the board every time it ran.
    const existing = await prisma.announcement.findFirst({
      where: { title: spec.title, deletedAt: null },
      select: { id: true },
    });

    const announcement =
      existing ??
      (await prisma.announcement.create({
        data: { title: spec.title, description: spec.description, date },
      }));
    if (!existing) created++;

    for (const code of spec.classes) {
      const classroomId = idOf.get(code);
      if (!classroomId) continue;
      await prisma.announcementClassroom.upsert({
        where: {
          announcementId_classroomId: {
            announcementId: announcement.id,
            classroomId,
          },
        },
        update: {},
        create: { announcementId: announcement.id, classroomId },
      });
    }
  }

  console.log(
    `  ${created} announcements posted (${ANNOUNCEMENTS.length} on the board)`,
  );
}

/**
 * The days the school is shut.
 *
 * Attendance and the presence app both read this: a day on the list is not a
 * day anybody was absent. With the table empty every national holiday counted
 * as a school day that the whole school missed.
 *
 * Dates are worked out from the year the school is in rather than written down
 * once, so this stays right as the years move.
 */
const HOLIDAYS: {
  monthDay: string;
  name: string;
  inSecondHalf: boolean;
}[] = [
  {
    monthDay: '08-17',
    name: 'Hari Kemerdekaan Republik Indonesia',
    inSecondHalf: false,
  },
  { monthDay: '12-25', name: 'Hari Raya Natal', inSecondHalf: false },
  { monthDay: '01-01', name: 'Tahun Baru Masehi', inSecondHalf: true },
  {
    monthDay: '05-01',
    name: 'Hari Buruh Internasional',
    inSecondHalf: true,
  },
  { monthDay: '06-01', name: 'Hari Lahir Pancasila', inSecondHalf: true },
];

export async function seedNonWorkingDays(
  prisma: PrismaClient,
  openingYear: number,
) {
  let created = 0;

  for (const holiday of HOLIDAYS) {
    const year = holiday.inSecondHalf ? openingYear + 1 : openingYear;
    const date = new Date(`${year}-${holiday.monthDay}T00:00:00.000Z`);

    const existing = await prisma.nonWorkingDay.findFirst({
      where: { date, deletedAt: null },
      select: { id: true },
    });
    if (existing) continue;

    await prisma.nonWorkingDay.create({ data: { date, name: holiday.name } });
    created++;
  }

  console.log(`  ${created} public holidays recorded`);
}
