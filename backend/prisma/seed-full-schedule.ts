import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

import { seedTeachersOnly } from './seeds/modules/teacher.seed.js';
import { seedFullSchedule } from './seeds/modules/full-schedule.seed.js';

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DIRECT_URL or DATABASE_URL is required for seeding');
}
const adapter = new PrismaPg({
  connectionString,
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('╔══════════════════════════════════════╗');
  console.log('║   Seed Guru & Jadwal Lengkap         ║');
  console.log('╚══════════════════════════════════════╝\n');

  console.log('── Step 1: Seed Guru ──');
  await seedTeachersOnly(prisma);

  console.log('\n── Step 2: Seed Jadwal (6 Kelas) ──');
  await seedFullSchedule(prisma);

  console.log('\n╔══════════════════════════════════════╗');
  console.log('║  ✓ Selesai                           ║');
  console.log('╚══════════════════════════════════════╝\n');
}

main()
  .catch((e) => {
    console.error('\n✗ Seed gagal:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
