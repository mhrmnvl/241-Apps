import { PrismaClient } from '@prisma/client';

export async function seedReligions(prisma: PrismaClient) {
  const names = [
    'Islam',
    'Kristen Protestan',
    'Katolik',
    'Hindu',
    'Buddha',
    'Konghucu',
  ];
  let created = 0;
  for (const name of names) {
    const exists = await prisma.religion.findFirst({ where: { name } });
    if (!exists) {
      await prisma.religion.create({ data: { name } });
      created++;
    }
  }
  console.log(
    `  [religion] ${created} created, ${await prisma.religion.count()} total`,
  );
}
