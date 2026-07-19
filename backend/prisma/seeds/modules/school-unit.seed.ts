import { SchoolUnitStatus, PrismaClient } from '@prisma/client';

const e = (key: string, fallback: string) => {
  const val = process.env[key];
  return val && val.trim() !== '' ? val : fallback;
};

export async function seedSchoolUnit(
  prisma: PrismaClient,
  schoolUnitTypeId: string | null,
) {
  let schoolUnit = await prisma.schoolUnit.findFirst({
    where: { deletedAt: null },
  });

  if (!schoolUnit) {
    schoolUnit = await prisma.schoolUnit.create({
      data: {
        typeId: schoolUnitTypeId,
        name: e('SEED_INSTITUTION_NAME', 'MTs Negeri 1 Kota Malang'),
        surname: e('SEED_INSTITUTION_SURNAME', 'MTsN 1 Malang'),
        nsm: e('SEED_INSTITUTION_NSM', '121135730001'),
        npsn: e('SEED_INSTITUTION_NPSN', '20518057'),
        status: e('SEED_INSTITUTION_STATUS', 'PUBLIC') as SchoolUnitStatus,
        npwp: e('SEED_INSTITUTION_NPWP', '00.000.000.0-000.000'),
        phone: e('SEED_INSTITUTION_PHONE', '0341000000'),
        email: e('SEED_INSTITUTION_EMAIL', 'info@mtsn1malang.sch.id'),
        website: e('SEED_INSTITUTION_WEBSITE', 'https://mtsn1malang.sch.id'),
        isActive: true,
      },
    });
    console.log(`  [school-unit] created: ${schoolUnit.name}`);
  } else {
    console.log(`  [school-unit] already exists: ${schoolUnit.name}`);
  }

  const igName = e('SEED_INSTITUTION_IG', '');
  if (igName) {
    const igPlatform = await prisma.socialMedia.findFirst({
      where: { name: 'Instagram' },
    });
    if (igPlatform) {
      const exists = await prisma.schoolUnitSocialMedia.findFirst({
        where: { schoolUnitId: schoolUnit.id, socialMediaId: igPlatform.id },
      });
      if (!exists) {
        await prisma.schoolUnitSocialMedia.create({
          data: {
            schoolUnitId: schoolUnit.id,
            socialMediaId: igPlatform.id,
            username: igName,
          },
        });
        console.log(`  [school-unit] Instagram linked: @${igName}`);
      }
    }
  }

  return { schoolUnit };
}
