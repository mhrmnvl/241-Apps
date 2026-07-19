import { PrismaClient } from '@prisma/client';

// ─── Mapel Umum (Kurikulum Merdeka) ───────────────────────────────────────────
// ─── + Mapel Diniyah/Kitab (sesuai guru yang terseed) ────────────────────────
const DEFAULT_SUBJECTS: { code: string; name: string }[] = [
  // Mapel PAI & Bahasa Arab (Madrasah wajib)
  { code: 'QH', name: "Al Qur'an Hadis" },
  { code: 'AA', name: 'Akidah Akhlak' },
  { code: 'FIK', name: 'Fikih' },
  { code: 'SKI', name: 'Sejarah Kebudayaan Islam' },
  { code: 'BAR', name: 'Bahasa Arab' },

  // Mapel Umum
  { code: 'PP', name: 'Pendidikan Pancasila' },
  { code: 'BINDO', name: 'Bahasa Indonesia' },
  { code: 'MTK', name: 'Matematika' },
  { code: 'IPA', name: 'Ilmu Pengetahuan Alam' },
  { code: 'IPS', name: 'Ilmu Pengetahuan Sosial' },
  { code: 'BING', name: 'Bahasa Inggris' },
  { code: 'PJOK', name: 'Pendidikan Jasmani, Olahraga dan Kesehatan' },
  { code: 'INFO', name: 'Informatika' },
  { code: 'SBP', name: 'Seni dan Budaya' },
  { code: 'BSUN', name: 'Bahasa Sunda' },

  // Mapel Diniyah / Kitab (Muatan Lokal Pesantren/Madrasah)
  { code: 'SYA', name: "Syari'ah" },
  { code: 'MH', name: 'Mustholah/Hadits' },
  { code: 'NAH', name: 'Nahwu Shorof' },
  { code: 'TA', name: "Tafsir Al-Qur'an" },
  { code: 'BAL', name: 'Balaghoh' },
  { code: 'TAU', name: 'Tauhid' },
  { code: 'MUS', name: "Muthola'ah" },
  { code: 'UF', name: 'Ushul Fiqih' },
];

export async function seedSubjects(prisma: PrismaClient) {
  let created = 0;

  for (const subject of DEFAULT_SUBJECTS) {
    const exists = await prisma.subject.findUnique({
      where: {
        name: subject.name,
      },
    });

    if (!exists) {
      await prisma.subject.create({
        data: {
          code: subject.code,
          name: subject.name,
        },
      });
      created++;
    } else if (!exists.code) {
      await prisma.subject.update({
        where: {
          name: subject.name,
        },
        data: { code: subject.code },
      });
    }
  }

  console.log(
    `  [subject] ${created} created, ${await prisma.subject.count()} total`,
  );
}
