import {
  EducationStatus,
  PrismaClient,
  ScholarshipStatus,
} from '@prisma/client';

export async function seedProfileExtras(prisma: PrismaClient) {
  const profiles = await prisma.profile.findMany({
    take: 3,
    select: { id: true, name: true },
  });

  if (profiles.length === 0) {
    console.log('  [profile-extras] ⚠ no profiles, skip');
    return;
  }

  let achievementCount = 0;
  let scholarshipCount = 0;
  let eduHistoryCount = 0;

  const profile1 = profiles[0];
  const achExists = await prisma.achievement.findFirst({
    where: { profileId: profile1.id, deletedAt: null },
  });
  if (!achExists) {
    const cityType = await prisma.achievementType.findFirst({
      where: { name: { contains: 'Kota', mode: 'insensitive' } },
    });
    const typeId = cityType?.id;

    if (typeId) {
      await prisma.achievement.create({
        data: {
          profileId: profile1.id,
          name: 'Juara 1 Olimpiade Matematika',
          level: 'Kota',
          typeId,
          year: 2024,
          description: 'Juara 1 Olimpiade Matematika Tingkat Kota Malang',
        },
      });
      achievementCount++;
    }
  }

  const profile2 = profiles[1] ?? profiles[0];
  const schExists = await prisma.scholarship.findFirst({
    where: { profileId: profile2.id, deletedAt: null },
  });
  if (!schExists) {
    await prisma.scholarship.create({
      data: {
        profileId: profile2.id,
        name: 'Beasiswa Prestasi Akademik',
        provider: 'Kementerian Agama RI',
        year: 2024,
        status: ScholarshipStatus.ACTIVE,
      },
    });
    scholarshipCount++;
  }

  const eduExists = await prisma.educationalHistory.findFirst({
    where: { profileId: profile1.id, deletedAt: null },
  });
  if (!eduExists) {
    await prisma.educationalHistory.create({
      data: {
        profileId: profile1.id,
        level: 'SD',
        institution: 'SD Negeri 1 Malang',
        startYear: 2018,
        endYear: 2024,
        status: EducationStatus.GRADUATED,
      },
    });
    eduHistoryCount++;
  }

  console.log(
    `  [profile-extras] achievement: ${achievementCount}, scholarship: ${scholarshipCount}, edu-history: ${eduHistoryCount}`,
  );
}
