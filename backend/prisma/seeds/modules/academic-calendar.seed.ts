import { PrismaClient } from '@prisma/client';

/**
 * One entry, dated by where it falls in a school year rather than by a
 * calendar year.
 *
 * `MM-DD`, plus which half of the year it belongs to. The dates were written
 * out in full — `2024-07-15` — so every seeded calendar landed in 2024 no
 * matter which year the school was actually in, and a school running 2026/2027
 * opened its calendar on two years of empty months.
 *
 * `inSecondHalf` is what turns a month-day into a date: the school year opens
 * in July and closes in June, so January to June belong to the *following*
 * calendar year.
 */
interface CalendarEntry {
  title: string;
  typeName: string;
  /** `MM-DD`. */
  startMonthDay: string;
  /** `MM-DD`. */
  endMonthDay: string;
  description: string | null;
  needsSemester: boolean;
  inSecondHalf: boolean;
}

const DEFAULT_ENTRIES: CalendarEntry[] = [
  {
    title: 'Awal Semester Ganjil',
    typeName: 'Awal Semester',
    startMonthDay: '07-15',
    endMonthDay: '07-15',
    description: 'Hari pertama masuk semester ganjil',
    needsSemester: true,
    inSecondHalf: false,
  },
  {
    title: 'Masa Taaruf Siswa Madrasah',
    typeName: 'Kegiatan Belajar Mengajar',
    startMonthDay: '07-15',
    endMonthDay: '07-17',
    description: 'Pengenalan lingkungan madrasah bagi peserta didik baru',
    needsSemester: true,
    inSecondHalf: false,
  },
  {
    title: 'Hari Kemerdekaan Republik Indonesia',
    typeName: 'Hari Libur Nasional',
    startMonthDay: '08-17',
    endMonthDay: '08-17',
    description: 'Upacara peringatan HUT RI, kegiatan belajar diliburkan',
    needsSemester: false,
    inSecondHalf: false,
  },
  {
    title: 'Ujian Tengah Semester Ganjil',
    typeName: 'Ujian Tengah Semester',
    startMonthDay: '10-07',
    endMonthDay: '10-11',
    description: 'Pelaksanaan UTS semester ganjil',
    needsSemester: true,
    inSecondHalf: false,
  },
  {
    title: 'Peringatan Hari Guru Nasional',
    typeName: 'Kegiatan Belajar Mengajar',
    startMonthDay: '11-25',
    endMonthDay: '11-25',
    description: 'Upacara dan kegiatan peringatan Hari Guru Nasional',
    needsSemester: true,
    inSecondHalf: false,
  },
  {
    title: 'Ujian Akhir Semester Ganjil',
    typeName: 'Ujian Akhir Semester',
    startMonthDay: '12-02',
    endMonthDay: '12-06',
    description: 'Pelaksanaan UAS semester ganjil',
    needsSemester: true,
    inSecondHalf: false,
  },
  {
    title: 'Pembagian Rapor Semester Ganjil',
    typeName: 'Kegiatan Belajar Mengajar',
    startMonthDay: '12-20',
    endMonthDay: '12-20',
    description: 'Penyerahan rapor kepada orang tua atau wali murid',
    needsSemester: true,
    inSecondHalf: false,
  },
  {
    title: 'Libur Semester Ganjil',
    typeName: 'Hari Libur Sekolah',
    startMonthDay: '12-23',
    endMonthDay: '12-31',
    description: 'Libur akhir semester ganjil',
    needsSemester: false,
    inSecondHalf: false,
  },
  {
    title: 'Awal Semester Genap',
    typeName: 'Awal Semester',
    startMonthDay: '01-06',
    endMonthDay: '01-06',
    description: 'Hari pertama masuk semester genap',
    needsSemester: true,
    inSecondHalf: true,
  },
  {
    title: 'Ujian Tengah Semester Genap',
    typeName: 'Ujian Tengah Semester',
    startMonthDay: '03-10',
    endMonthDay: '03-14',
    description: 'Pelaksanaan UTS semester genap',
    needsSemester: true,
    inSecondHalf: true,
  },
  {
    title: 'Ujian Akhir Madrasah Kelas IX',
    typeName: 'Ujian Akhir Semester',
    startMonthDay: '04-20',
    endMonthDay: '04-25',
    description: 'Ujian akhir bagi peserta didik kelas IX',
    needsSemester: true,
    inSecondHalf: true,
  },
  {
    title: 'Ujian Akhir Semester Genap',
    typeName: 'Ujian Akhir Semester',
    startMonthDay: '05-26',
    endMonthDay: '05-30',
    description: 'Pelaksanaan UAS semester genap',
    needsSemester: true,
    inSecondHalf: true,
  },
  {
    title: 'Pendaftaran Peserta Didik Baru',
    typeName: 'Registrasi/Pendaftaran',
    startMonthDay: '06-01',
    endMonthDay: '06-30',
    description: 'Periode PPDB tahun ajaran baru',
    needsSemester: false,
    inSecondHalf: true,
  },
  {
    title: 'Libur Akhir Tahun Ajaran',
    typeName: 'Hari Libur Sekolah',
    startMonthDay: '06-20',
    endMonthDay: '06-30',
    description: 'Libur kenaikan kelas',
    needsSemester: false,
    inSecondHalf: true,
  },
];

export async function seedAcademicCalendar(
  prisma: PrismaClient,
  academicYearId: string,
  semesters: { id: string; typeName: string }[],
  /**
   * The calendar year the school year opens in — 2026 for "2026/2027".
   *
   * Passed rather than assumed, and the entries are dated from it. Without it
   * every calendar came out in 2024.
   */
  openingYear: number,
) {
  const ganjil = semesters.find((s) => s.typeName === 'ODD');
  const genap = semesters.find((s) => s.typeName === 'EVEN');

  const dateOf = (monthDay: string, inSecondHalf: boolean) =>
    new Date(
      `${inSecondHalf ? openingYear + 1 : openingYear}-${monthDay}T00:00:00.000Z`,
    );

  const types = await prisma.academicCalendarType.findMany();

  let created = 0;
  for (const entry of DEFAULT_ENTRIES) {
    const semesterId = entry.needsSemester
      ? ((entry.inSecondHalf ? genap?.id : ganjil?.id) ?? null)
      : null;

    const typeRecord = types.find((t) => t.name === entry.typeName);
    if (!typeRecord) {
      console.log(
        `  [academic-calendar] ⚠ type "${entry.typeName}" not found, skip entry "${entry.title}"`,
      );
      continue;
    }

    const exists = await prisma.academicCalendar.findFirst({
      where: { academicYearId, title: entry.title, deletedAt: null },
    });

    if (!exists) {
      await prisma.academicCalendar.create({
        data: {
          academicYearId,
          semesterId,
          title: entry.title,
          typeId: typeRecord.id,
          startDate: dateOf(entry.startMonthDay, entry.inSecondHalf),
          endDate: dateOf(entry.endMonthDay, entry.inSecondHalf),
          description: entry.description,
        },
      });
      created++;
    }
  }

  console.log(
    `  [academic-calendar] ${created} created, ${DEFAULT_ENTRIES.length} configured`,
  );
}
