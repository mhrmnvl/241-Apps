import { PrismaClient } from '@prisma/client';

export async function seedAdmission(prisma: PrismaClient) {
  console.log('  [admission] seeding document types and sample wave...');

  const documentTypes = [
    { code: 'KK', name: 'Kartu Keluarga', isRequired: true, sortOrder: 1 },
    {
      code: 'AKTA_LAHIR',
      name: 'Akta Kelahiran',
      isRequired: true,
      sortOrder: 2,
    },
    { code: 'IJAZAH', name: 'Ijazah / SKL', isRequired: true, sortOrder: 3 },
    { code: 'PAS_FOTO', name: 'Pas Foto 3x4', isRequired: true, sortOrder: 4 },
    { code: 'RAPOR', name: 'Rapor Terakhir', isRequired: false, sortOrder: 5 },
    {
      code: 'KTP_ORTU',
      name: 'KTP Orang Tua/Wali',
      isRequired: false,
      sortOrder: 6,
    },
  ];

  for (const dt of documentTypes) {
    await prisma.admissionDocumentType.upsert({
      where: { code: dt.code },
      update: {
        name: dt.name,
        isRequired: dt.isRequired,
        sortOrder: dt.sortOrder,
        isActive: true,
      },
      create: { ...dt, isActive: true },
    });
  }
  console.log(`  [admission] seeded ${documentTypes.length} document types.`);

  let academicYear = await prisma.academicYear.findFirst({
    where: { isActive: true, deletedAt: null },
  });
  if (!academicYear) {
    academicYear = await prisma.academicYear.findFirst({
      where: { deletedAt: null },
      orderBy: { name: 'desc' },
    });
  }
  if (!academicYear) {
    const year = new Date().getFullYear();
    const name = `${year}/${year + 1}`;
    academicYear = await prisma.academicYear.upsert({
      where: { name },
      update: {},
      create: { name, isActive: true },
    });
    console.log(`  [admission] created sample academic year '${name}'.`);
  }

  const waveCode = `G1-${academicYear.name.split('/')[0] ?? academicYear.name}`;
  const now = new Date();
  const start = new Date(now);
  start.setDate(start.getDate() - 7);
  const end = new Date(now);
  end.setMonth(end.getMonth() + 3);

  await prisma.admissionWave.upsert({
    where: { code: waveCode },
    update: { isActive: true, deletedAt: null },
    create: {
      name: `Gelombang 1 — ${academicYear.name}`,
      code: waveCode,
      academicYearId: academicYear.id,
      startDate: start,
      endDate: end,
      quota: 100,
      registrationFee: 250000,
      description:
        'Gelombang pertama Penerimaan Santri Baru. Kuota terbatas, segera daftar!',
      isActive: true,
    },
  });
  console.log(`  [admission] sample wave '${waveCode}' ready.`);
}
