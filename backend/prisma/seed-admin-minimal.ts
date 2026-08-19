import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, UserGender } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import 'dotenv/config';

/**
 * Minimal, admin-only seed. Creates ONLY the admin user (+ profile) and the
 * SUPER_ADMIN role, then links them. Nothing else — no lookups, no school unit,
 * no other roles/permissions. SUPER_ADMIN bypasses every permission check (see
 * PermissionsGuard), so this is enough to log in and build/test the rest of the
 * data manually through the UI.
 *
 * The username and the fallback password are in this file, which is a
 * deliberate trade-off for a bootstrap script: it has to work on an empty
 * database with nothing configured. But a password committed to a repository is
 * a password everyone with the repository knows, so SEED_ADMIN_PASSWORD
 * overrides it — set that on any box that is reachable and the real credential
 * never touches git.
 *
 *   SEED_ADMIN_PASSWORD='...' pnpm seed:admin-minimal
 *
 * **This repository is public, and the fallback below is `admin123`.** Treat it
 * as a value that is already known to everyone, because it is. Seeding without
 * SEED_ADMIN_PASSWORD is safe only on a database nobody else can reach — not
 * the dev box, which answers on the same VPS as production.
 *
 * Either way, change it after first login. This account is SUPER_ADMIN, the one
 * role that bypasses every permission check, so an unchanged default here is
 * not a small exposure — it is the whole system.
 *
 * Only the DB connection is otherwise read from the environment
 * (DATABASE_URL / DIRECT_URL).
 *
 * Run (from backend/): pnpm seed:admin-minimal
 */
const ADMIN = {
  username: 'admin',
  // Overridable, so a real password need not be committed. See the note above.
  password: process.env.SEED_ADMIN_PASSWORD ?? 'admin123',
  name: 'Administrator',
  nik: '0000000000000001',
  gender: UserGender.MALE,
  birthPlace: 'Bandung',
  birthDate: new Date('1980-01-01'),
  email: 'admin@241.sch.id',
  phone: '081234567890',
};

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

  console.log('── Admin user ──');
  const passwordHash = await bcrypt.hash(ADMIN.password, 10);
  const user = await prisma.user.upsert({
    where: { identifier: ADMIN.username },
    update: { passwordHash, isActive: true, deletedAt: null },
    create: { identifier: ADMIN.username, passwordHash, isActive: true },
  });

  const existingProfile = await prisma.profile.findUnique({
    where: { userId: user.id },
  });
  if (!existingProfile) {
    await prisma.profile.create({
      data: {
        userId: user.id,
        name: ADMIN.name,
        nik: ADMIN.nik,
        gender: ADMIN.gender,
        birthPlace: ADMIN.birthPlace,
        birthDate: ADMIN.birthDate,
        email: ADMIN.email,
        phone: ADMIN.phone,
      },
    });
  }

  console.log('── SUPER_ADMIN role ──');
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

  console.log('── Linking admin → SUPER_ADMIN ──');
  await prisma.userRole.deleteMany({ where: { userId: user.id } });
  await prisma.userRole.create({
    data: { userId: user.id, roleId: superAdmin.id },
  });

  console.log(
    `\n✓ Done. Login as "${ADMIN.username}" / "${ADMIN.password}" (SUPER_ADMIN).`,
  );
  console.log('  Everything else is empty for manual testing.');
}

main()
  .catch((e) => {
    console.error('\n✗ Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
