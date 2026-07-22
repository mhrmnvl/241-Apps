import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
const adapter = new PrismaPg({ connectionString, ssl: { rejectUnauthorized: false } });
const prisma = new PrismaClient({ adapter });

// Does the system_key column even exist yet?
try {
  const col = await prisma.$queryRawUnsafe(
    `SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'inventory_statuses' AND column_name = 'system_key';`
  );
  console.log('system_key column exists:', JSON.stringify(col));
} catch (e) {
  console.log('column check error:', e.message);
}

const statuses = await prisma.inventoryStatus.findMany();
console.log('statuses:', JSON.stringify(statuses.map(s => ({ code: s.code, name: s.name, systemKey: s.systemKey })), null, 2));

const asset = await prisma.inventoryAsset.findFirst({
  orderBy: { updatedAt: 'desc' },
});
console.log('most recently updated asset (raw scalar):', JSON.stringify({
  name: asset?.name, brand: asset?.brand, model: asset?.model, purchasePrice: asset?.purchasePrice, updatedAt: asset?.updatedAt,
}));

await prisma.$disconnect();
