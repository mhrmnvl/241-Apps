import { PrismaClient } from '@prisma/client';

const e = (key: string, fallback: string) => process.env[key] ?? fallback;

export async function seedPositions(prisma: PrismaClient) {
  // Seed Position Categories first
  const categories = [
    { code: 'MANAGEMENT', name: 'Management' },
    { code: 'FINANCE', name: 'Finance' },
    { code: 'ADMIN', name: 'Administration' },
    { code: 'ACADEMIC', name: 'Academic' },
  ];

  const categoryMap = new Map<string, string>();

  for (const cat of categories) {
    let dbCat = await prisma.positionCategory.findUnique({
      where: { code: cat.code },
    });
    dbCat ??= await prisma.positionCategory.create({
      data: cat,
    });
    categoryMap.set(cat.code, dbCat.id);
  }

  const raw = e(
    'SEED_POSITIONS',
    'Kepala Sekolah:MANAGEMENT,Wakil Kepala Sekolah:MANAGEMENT,Bendahara:FINANCE,Staf TU:ADMIN,Wali Kelas:ACADEMIC,Guru:ACADEMIC,Guru Piket:ACADEMIC',
  );

  const entries = raw
    .split(',')
    .map((item) => {
      const [name, cat] = item.trim().split(':');
      return {
        name: name.trim(),
        categoryCode: cat?.trim() ?? 'ACADEMIC',
      };
    })
    .filter((p) => p.name);

  let created = 0;
  for (const { name, categoryCode } of entries) {
    const categoryId = categoryMap.get(categoryCode);
    if (!categoryId) continue;

    const exists = await prisma.position.findFirst({ where: { name } });
    if (!exists) {
      await prisma.position.create({
        data: { name, categoryId },
      });
      created++;
    }
  }
  console.log(
    `  [position] ${created} created, ${await prisma.position.count()} total`,
  );
}
