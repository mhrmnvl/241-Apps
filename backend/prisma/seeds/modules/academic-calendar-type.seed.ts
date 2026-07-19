import { PrismaClient } from '@prisma/client';

export async function seedAcademicCalendarTypes(prisma: PrismaClient) {
  const names = [
    'Awal Semester',
    'Akhir Semester',
    'Ujian Tengah Semester',
    'Ujian Akhir Semester',
    'Registrasi/Pendaftaran',
    'Hari Libur Nasional',
    'Hari Libur Mingguan',
    'Hari Libur Sekolah',
    'Kegiatan Belajar Mengajar',
    'Lainnya',
  ];
  let created = 0;
  for (const name of names) {
    const exists = await prisma.academicCalendarType.findFirst({
      where: { name },
    });
    if (!exists) {
      await prisma.academicCalendarType.create({ data: { name } });
      created++;
    }
  }
  console.log(
    `  [academic-calendar-type] ${created} created, ${await prisma.academicCalendarType.count()} total`,
  );
}
