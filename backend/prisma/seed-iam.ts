import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import { pgSslOptions } from '../src/core/database/pg-ssl.js';
import { seedIam } from './seeds/modules/iam.seed.js';

/**
 * Put every role back to what the code says it should hold.
 *
 * Roles drift. A permission gets granted on the role screen to get one person
 * past one refusal, and it stays: the development box had TEACHER holding 182
 * codes — four more than ADMIN — including `users.delete`, `roles.create` and
 * `permissions.manage`. Nobody decided that; it accumulated. The result was
 * that every teacher's sidebar carried Daftar Siswa, Akun Guru, Kelola
 * Pengguna and Manajemen Permission, because the menu asks what you may do and
 * the answer had quietly become "anything".
 *
 * `iam.seed.ts` is where the answer is written down. This runs that part of
 * the seed and nothing else, so a box can be brought back to it without
 * re-seeding its data.
 *
 *   pnpm --filter backend seed:iam
 *
 * It clears and rewrites the grants of the six built-in roles — SUPER_ADMIN,
 * ADMIN, TEACHER, STUDENT, PARENT, PRINCIPAL. **Anything granted to those
 * roles by hand is discarded.** Roles the school created itself are not
 * touched, and no user's role assignment changes.
 */
const connectionString = process.env.DATABASE_URL ?? '';
const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString,
    ...pgSslOptions(connectionString),
  }),
});

async function main() {
  console.log('\n=== Resetting the built-in roles to the code baseline ===\n');
  await seedIam(prisma);

  const roles = await prisma.role.findMany({
    where: {
      code: {
        in: [
          'SUPER_ADMIN',
          'ADMIN',
          'TEACHER',
          'STUDENT',
          'PARENT',
          'PRINCIPAL',
        ],
      },
    },
    select: { code: true, _count: { select: { rolePermissions: true } } },
    orderBy: { code: 'asc' },
  });

  console.log('\nGrants now held:');
  for (const role of roles) {
    console.log(`  ${role.code.padEnd(12)} ${role._count.rolePermissions}`);
  }
}

main()
  .catch((e) => {
    console.error('\n✗ Reset failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
