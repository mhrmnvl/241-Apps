import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL || process.env.DIRECT_URL;
const adapter = new PrismaPg({ connectionString, ssl: { rejectUnauthorized: false } });
const prisma = new PrismaClient({ adapter });

const asset = await prisma.inventoryAsset.findFirst({
  include: {
    category: true,
    fundingSource: true,
    units: { include: { status: true, condition: true, location: true } },
  },
  orderBy: { updatedAt: 'desc' },
});

// Simulate exactly what crosses the wire: JSON.stringify (Express res.json) then JSON.parse (axios).
const newAsset = JSON.parse(JSON.stringify(asset));

console.log('=== newAsset scalar fields after JSON round-trip ===');
console.log(JSON.stringify({
  name: newAsset.name,
  categoryId: newAsset.categoryId,
  brand: newAsset.brand,
  model: newAsset.model,
  purchaseDate: newAsset.purchaseDate,
  purchasePrice: newAsset.purchasePrice,
  fundingSourceId: newAsset.fundingSourceId,
  notes: newAsset.notes,
  unitsLength: newAsset.units?.length,
}, null, 2));

// Now literally replay AssetForm.vue's watch handler logic:
try {
  const firstUnit = newAsset.units?.[0];
  const values = {
    name: newAsset.name,
    categoryId: newAsset.categoryId,
    brand: newAsset.brand ?? '',
    model: newAsset.model ?? '',
    serialNumber: firstUnit?.serialNumber ?? '',
    purchaseDate: newAsset.purchaseDate ? newAsset.purchaseDate.split('T')[0] : '',
    purchasePrice: Number(newAsset.purchasePrice),
    fundingSourceId: newAsset.fundingSourceId ?? 'none',
    quantity: 1,
    locationId: firstUnit?.locationId ?? '',
    statusId: firstUnit?.statusId ?? '',
    conditionId: firstUnit?.conditionId ?? '',
    notes: newAsset.notes ?? '',
  };
  console.log('=== computed setValues() payload (what AssetForm would set) ===');
  console.log(JSON.stringify(values, null, 2));
} catch (e) {
  console.log('=== THREW AN ERROR during setValues computation ===');
  console.log(e.message);
  console.log(e.stack);
}

await prisma.$disconnect();
