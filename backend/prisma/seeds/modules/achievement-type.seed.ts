import { PrismaClient } from '@prisma/client';

export async function seedAchievementTypes(prisma: PrismaClient) {
  const names = [
    'Kabupaten/Kota',
    'Kota',
    'Provinsi',
    'Nasional',
    'Internasional',
  ];
  let created = 0;
  for (const name of names) {
    const exists = await prisma.achievementType.findFirst({ where: { name } });
    if (!exists) {
      await prisma.achievementType.create({ data: { name } });
      created++;
    }
  }
  console.log(
    `  [achievement-type] ${created} created, ${await prisma.achievementType.count()} total`,
  );
}
