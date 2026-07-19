import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

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
  console.log('║   SIAKAD Admin-Only Seeder       ║');
  console.log('╚══════════════════════════════════╝\n');

  const unit = await prisma.schoolUnit.findFirst({
    where: { isActive: true, deletedAt: null },
  });
  if (!unit) {
    throw new Error(
      'No active school unit found. Please run the main seeder first!',
    );
  }

  const username = 'admin';
  const password = await bcrypt.hash('admin123', 10);

  const user = await prisma.user.upsert({
    where: {
      identifier: username,
    },
    update: {
      passwordHash: password,
      isActive: true,
      deletedAt: null,
    },
    create: {
      identifier: username,
      passwordHash: password,
      isActive: true,
    },
  });

  console.log(`  [admin] created: ${user.identifier} (${user.id})`);

  console.log('\n╔══════════════════════════════════╗');
  console.log('║  ✓ Admin seed completed          ║');
  console.log('╚══════════════════════════════════╝\n');
}

main()
  .catch((e) => {
    console.error('\n✗ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
