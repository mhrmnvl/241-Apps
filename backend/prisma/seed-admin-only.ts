import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

import { seedLookupData } from './seeds/modules/lookup.seed.js';
import { seedSchoolUnit } from './seeds/modules/school-unit.seed.js';
import { seedAdmin } from './seeds/modules/admin.seed.js';
import { seedIam } from './seeds/modules/iam.seed.js';

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
  console.log('║   Seed Admin User & Roles Only   ║');
  console.log('╚══════════════════════════════════╝\n');

  console.log('── Seeding Lookups ──');
  const { seededUnitTypes } = await seedLookupData(prisma);

  console.log('\n── Seeding School Unit ──');
  await seedSchoolUnit(prisma, seededUnitTypes['SMP'] ?? null);

  console.log('\n── Seeding Admin User ──');
  await seedAdmin(prisma);

  console.log('\n── Seeding IAM Roles & Permissions ──');
  await seedIam(prisma);

  console.log('\n✓ Admin and basic setup completed successfully!');
}

main()
  .catch((e) => {
    console.error('\n✗ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
