import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

import { seedTimeSlots } from './seeds/modules/time-slot.seed.js';

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DIRECT_URL or DATABASE_URL is required for seeding');
}
const adapter = new PrismaPg({
  connectionString,
  ssl: {
    rejectUnauthorized: false,
  },
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('╔══════════════════════════════════╗');
  console.log('║   Seed Time Slots Only           ║');
  console.log('╚══════════════════════════════════╝\n');

  await seedTimeSlots(prisma);

  console.log('\n✓ Time slots seeded successfully');
}

main()
  .catch((e) => {
    console.error('\n✗ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
