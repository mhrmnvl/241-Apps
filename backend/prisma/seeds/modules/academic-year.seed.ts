import { PrismaClient } from '@prisma/client';

const e = (key: string, fallback: string) => process.env[key] ?? fallback;

export async function seedAcademicYear(
  prisma: PrismaClient,
  schoolUnitId: string,
) {
  const name = e('SEED_ACADEMIC_YEAR_NAME', '2024/2025');

  let ay = await prisma.academicYear.findFirst({
    where: { name, deletedAt: null },
  });

  if (!ay) {
    await prisma.academicYear.updateMany({
      where: { isActive: true },
      data: { isActive: false },
    });
    ay = await prisma.academicYear.create({
      data: { name, isActive: true },
    });
    console.log(`  [academic-year] created: ${name} (active)`);
  } else {
    console.log(`  [academic-year] already exists: ${name}`);
  }
  return ay;
}
