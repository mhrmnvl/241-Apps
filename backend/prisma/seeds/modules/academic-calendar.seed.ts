import { PrismaClient } from '@prisma/client';

interface CalendarEntry {
  title: string;
  typeName: string;
  startDate: string;
  endDate: string;
  description: string | null;
  needsSemester: boolean;
}

const DEFAULT_ENTRIES: CalendarEntry[] = [
  {
    title: 'Awal Semester Ganjil',
    typeName: 'Awal Semester',
    startDate: '2024-07-15',
    endDate: '2024-07-15',
    description: 'Hari pertama masuk semester ganjil',
    needsSemester: true,
  },
  {
    title: 'Ujian Tengah Semester Ganjil',
    typeName: 'Ujian Tengah Semester',
    startDate: '2024-10-07',
    endDate: '2024-10-11',
    description: 'Pelaksanaan UTS semester ganjil',
    needsSemester: true,
  },
  {
    title: 'Ujian Akhir Semester Ganjil',
    typeName: 'Ujian Akhir Semester',
    startDate: '2024-12-02',
    endDate: '2024-12-06',
    description: 'Pelaksanaan UAS semester ganjil',
    needsSemester: true,
  },
  {
    title: 'Libur Semester Ganjil',
    typeName: 'Hari Libur Sekolah',
    startDate: '2024-12-23',
    endDate: '2025-01-03',
    description: 'Libur akhir semester ganjil',
    needsSemester: false,
  },
  {
    title: 'Awal Semester Genap',
    typeName: 'Awal Semester',
    startDate: '2025-01-06',
    endDate: '2025-01-06',
    description: 'Hari pertama masuk semester genap',
    needsSemester: true,
  },
  {
    title: 'Ujian Tengah Semester Genap',
    typeName: 'Ujian Tengah Semester',
    startDate: '2025-03-10',
    endDate: '2025-03-14',
    description: 'Pelaksanaan UTS semester genap',
    needsSemester: true,
  },
  {
    title: 'Ujian Akhir Semester Genap',
    typeName: 'Ujian Akhir Semester',
    startDate: '2025-05-26',
    endDate: '2025-05-30',
    description: 'Pelaksanaan UAS semester genap',
    needsSemester: true,
  },
  {
    title: 'Hari Kemerdekaan RI',
    typeName: 'Hari Libur Nasional',
    startDate: '2024-08-17',
    endDate: '2024-08-17',
    description: 'Hari Kemerdekaan Republik Indonesia',
    needsSemester: false,
  },
  {
    title: 'Pendaftaran Peserta Didik Baru',
    typeName: 'Registrasi/Pendaftaran',
    startDate: '2025-06-01',
    endDate: '2025-06-30',
    description: 'Periode PPDB tahun ajaran baru',
    needsSemester: false,
  },
];

export async function seedAcademicCalendar(
  prisma: PrismaClient,
  academicYearId: string,
  semesters: { id: string; typeName: string }[],
) {
  const ganjil = semesters.find((s) => s.typeName === 'ODD');
  const genap = semesters.find((s) => s.typeName === 'EVEN');

  const types = await prisma.academicCalendarType.findMany();

  let created = 0;
  for (const entry of DEFAULT_ENTRIES) {
    let semesterId: string | null = null;
    if (entry.needsSemester) {
      const month = parseInt(entry.startDate.split('-')[1], 10);
      semesterId = month >= 7 ? (ganjil?.id ?? null) : (genap?.id ?? null);
    }

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
          startDate: new Date(entry.startDate),
          endDate: new Date(entry.endDate),
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
