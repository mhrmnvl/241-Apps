import { PrismaClient } from '@prisma/client';

const e = (key: string, fallback: string) => {
  const val = process.env[key];
  return val && val.trim() !== '' ? val : fallback;
};

export async function seedParents(prisma: PrismaClient) {
  const count = parseInt(e('SEED_PARENT_COUNT', '2'), 10);
  const parents: { id: string }[] = [];

  for (let i = 1; i <= count; i++) {
    const n = String(i);
    const nik = e(
      `SEED_PARENT_${n}_NIK`,
      `35730${String(i).padStart(11, '0')}`,
    );
    const existing = await prisma.parent.findUnique({ where: { nik } });
    if (existing) {
      parents.push({ id: existing.id });
      continue;
    }

    const occName = e(
      `SEED_PARENT_${n}_OCCUPATION`,
      i % 2 === 0 ? 'Wiraswasta' : 'PNS',
    );
    const eduName = process.env[`SEED_PARENT_${n}_EDUCATION`] ?? null;

    const occ = await prisma.occupation.findFirst({ where: { name: occName } });
    if (!occ) {
      console.log(`  [parent] ⚠ occupation "${occName}" not found, skip ${n}`);
      continue;
    }

    const edu = eduName
      ? await prisma.education.findFirst({ where: { name: eduName } })
      : null;

    const parent = await prisma.parent.create({
      data: {
        name: e(`SEED_PARENT_${n}_NAME`, `Orang Tua ${n}`),
        nik,
        birthPlace: e(`SEED_PARENT_${n}_BIRTH_PLACE`, 'Malang'),
        birthDate: new Date(e(`SEED_PARENT_${n}_BIRTH_DATE`, '1975-01-01')),
        email: process.env[`SEED_PARENT_${n}_EMAIL`] ?? null,
        phone: process.env[`SEED_PARENT_${n}_PHONE`] ?? null,
        occupationId: occ.id,
        educationId: edu?.id ?? null,
      },
    });

    await prisma.address.create({
      data: {
        parentId: parent.id,
        street: e(`SEED_PARENT_${n}_STREET`, 'Jl. Pelangi No. 10'),
        rt: e(`SEED_PARENT_${n}_RT`, '001'),
        rw: e(`SEED_PARENT_${n}_RW`, '001'),
        village: e(`SEED_PARENT_${n}_VILLAGE`, 'Bareng'),
        district: e(`SEED_PARENT_${n}_DISTRICT`, 'Klojen'),
        city: e(`SEED_PARENT_${n}_CITY`, 'Kota Malang'),
        province: e(`SEED_PARENT_${n}_PROVINCE`, 'Jawa Timur'),
        postalCode: e(`SEED_PARENT_${n}_POSTAL`, '65116'),
        isPrimary: true,
      },
    });

    parents.push({ id: parent.id });
    console.log(`  [parent] ${e(`SEED_PARENT_${n}_NAME`, `Orang Tua ${n}`)}`);
  }
  return parents;
}
