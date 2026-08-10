import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

import { seedLeaveTypes } from './seeds/modules/leave-type.seed.js';
import { seedWorkPatterns } from './seeds/modules/work-pattern.seed.js';

/**
 * Seeds only what the presence domain needs to function, for a database that
 * already holds real data and must not be reseeded wholesale.
 *
 * Both seeds are idempotent — the work pattern is skipped when a default
 * already exists, and leave types are matched on their unique code — so this is
 * safe to re-run.
 *
 * The default work pattern is not optional decoration: without it every scan
 * resolves to NOT_EXPECTED, because a person can only be judged late against
 * hours somebody defined.
 */
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
  console.log('║   Seed Presence Reference Data   ║');
  console.log('╚══════════════════════════════════╝\n');

  await seedWorkPatterns(prisma);
  await seedLeaveTypes(prisma);

  console.log('\n✓ Presence reference data seeded successfully');
}

main()
  .catch((e) => {
    console.error('\n✗ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => void prisma.$disconnect());
