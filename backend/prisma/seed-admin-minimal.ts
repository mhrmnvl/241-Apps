import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';

import { seedAdmin } from './seeds/modules/admin.seed.js';

/**
 * Minimal, admin-only seed: creates ONLY the admin user (+ profile) and the
 * SUPER_ADMIN role, then links them. Nothing else — no lookups, no school unit,
 * no other roles or permissions. SUPER_ADMIN bypasses every permission check
 * (see PermissionsGuard), so this is enough to log in and build/test the rest
 * of the data manually through the UI.
 *
 * Run (from backend/): pnpm seed:admin-minimal
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
  console.log('╔══════════════════════════════════════╗');
  console.log('║   Seed: ADMIN ONLY (minimal, clean)  ║');
  console.log('╚══════════════════════════════════════╝\n');

  console.log('── Admin user (+ profile) ──');
  const admin = await seedAdmin(prisma);

  console.log('\n── SUPER_ADMIN role ──');
  const superAdmin = await prisma.role.upsert({
    where: { code: 'SUPER_ADMIN' },
    update: {
      name: 'Super Admin',
      description: 'Platform Super Admin',
      isSystem: true,
    },
    create: {
      code: 'SUPER_ADMIN',
      name: 'Super Admin',
      description: 'Platform Super Admin',
      isSystem: true,
    },
  });

  console.log('\n── Linking admin → SUPER_ADMIN ──');
  await prisma.userRole.deleteMany({ where: { userId: admin.id } });
  await prisma.userRole.create({
    data: { userId: admin.id, roleId: superAdmin.id },
  });

  const username = process.env.SEED_ADMIN_USERNAME ?? 'admin';
  console.log(
    `\n✓ Done. Login as "${username}" (SUPER_ADMIN). Everything else is empty for manual testing.`,
  );
}

main()
  .catch((e) => {
    console.error('\n✗ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
