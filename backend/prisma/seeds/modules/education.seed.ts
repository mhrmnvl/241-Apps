import { PrismaClient } from '@prisma/client';

const e = (key: string, fallback: string) => process.env[key] ?? fallback;

export async function seedEducations(prisma: PrismaClient) {
  const names = e('SEED_EDUCATIONS', 'SD,SMP,SMA/SMK,D3,D4,S1,S2,S3')
    .split(',')
    .map((n) => n.trim())
    .filter(Boolean);

  let created = 0;
  for (const name of names) {
    const exists = await prisma.education.findFirst({ where: { name } });
    if (!exists) {
      await prisma.education.create({ data: { name } });
      created++;
    }
  }
  console.log(
    `  [education] ${created} created, ${await prisma.education.count()} total`,
  );
}
