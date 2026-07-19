import { PrismaClient } from '@prisma/client';

export async function seedLookupData(prisma: PrismaClient) {
  // 1. Seed School Unit Types
  const unitTypes = [
    { code: 'TK', name: 'Taman Kanak-kanak (TK / RA)' },
    { code: 'SD', name: 'Sekolah Dasar (SD / MI)' },
    { code: 'SMP', name: 'Sekolah Menengah Pertama (SMP / MTs)' },
    { code: 'SMA', name: 'Sekolah Menengah Atas (SMA / MA / SMK)' },
    { code: 'SLB', name: 'Sekolah Luar Biasa (SLB)' },
    { code: 'PKBM', name: 'Pusat Kegiatan Belajar Masyarakat (PKBM)' },
    { code: 'LKP', name: 'Lembaga Kursus dan Pelatihan (LKP)' },
    { code: 'PESANTREN', name: 'Pondok Pesantren' },
    { code: 'OTHER', name: 'Lainnya' },
  ];

  console.log('  [lookup] Seeding school unit types...');
  const seededUnitTypes: Record<string, string> = {};
  for (const ut of unitTypes) {
    let existing = await prisma.schoolUnitType.findUnique({
      where: { code: ut.code },
    });
    if (!existing) {
      existing = await prisma.schoolUnitType.create({ data: ut });
      console.log(`    School Unit Type created: ${ut.name}`);
    }
    seededUnitTypes[ut.code] = existing.id;
  }

  // 2. Seed System File Categories
  const fileCategories = [
    {
      code: 'PROFILE_PHOTO',
      name: 'Foto Profil',
      description: 'Foto profil pengguna',
      isSystem: true,
    },
    {
      code: 'DOCUMENT',
      name: 'Dokumen Pribadi',
      description: 'KTP, KK, Akta Kelahiran, dll',
      isSystem: true,
    },
    {
      code: 'REPORT_CARD',
      name: 'Rapor',
      description: 'Laporan hasil belajar siswa',
      isSystem: true,
    },
    {
      code: 'CERTIFICATE',
      name: 'Sertifikat',
      description: 'Sertifikat prestasi atau pelatihan',
      isSystem: true,
    },
    {
      code: 'OTHER',
      name: 'Lainnya',
      description: 'Berkas umum lainnya',
      isSystem: true,
    },
  ];

  console.log('  [lookup] Seeding system file categories...');
  for (const fc of fileCategories) {
    const existing = await prisma.fileCategory.findFirst({
      where: { code: fc.code, isSystem: true },
    });
    if (!existing) {
      await prisma.fileCategory.create({ data: fc });
      console.log(`    File Category created: ${fc.name}`);
    }
  }

  return { seededUnitTypes };
}
