import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import 'dotenv/config';
import pg from 'pg';

const connectionString = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
const pool = new pg.Pool({
  connectionString,
  ssl: { rejectUnauthorized: false },
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({
    include: {
      userRoles: {
        include: {
          role: true,
        },
      },
    },
  });

  console.log('--- ALL USERS IN DB ---');
  for (const u of users) {
    console.log(`User: ${u.identifier} (ID: ${u.id})`);
    console.log(`Roles: ${u.userRoles.map((ur) => ur.role.code).join(', ')}`);
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
