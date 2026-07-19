import { PrismaClient } from '@prisma/client';

export async function seedBloodTypes(prisma: PrismaClient) {
  const names = [
    'A',
    'B',
    'AB',
    'O',
    'A+',
    'A-',
    'B+',
    'B-',
    'AB+',
    'AB-',
    'O+',
    'O-',
  ];
  let created = 0;
  for (const name of names) {
    const exists = await prisma.bloodType.findFirst({ where: { name } });
    if (!exists) {
      await prisma.bloodType.create({ data: { name } });
      created++;
    }
  }
  console.log(
    `  [blood-type] ${created} created, ${await prisma.bloodType.count()} total`,
  );
}
