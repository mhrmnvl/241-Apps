import { PrismaClient } from '@prisma/client';

const e = (key: string, fallback: string) => process.env[key] ?? fallback;

export async function seedOccupations(prisma: PrismaClient) {
  const names = e(
    'SEED_OCCUPATIONS',
    'PNS,PPPK,TNI/Polri,Wiraswasta,Karyawan Swasta,Buruh,Petani,Lainnya',
  )
    .split(',')
    .map((n) => n.trim())
    .filter(Boolean);

  let created = 0;
  for (const name of names) {
    const exists = await prisma.occupation.findFirst({ where: { name } });
    if (!exists) {
      await prisma.occupation.create({ data: { name } });
      created++;
    }
  }
  console.log(
    `  [occupation] ${created} created, ${await prisma.occupation.count()} total`,
  );
}
