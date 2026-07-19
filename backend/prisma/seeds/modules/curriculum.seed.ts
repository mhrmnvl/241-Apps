import { PrismaClient } from '@prisma/client';

const e = (key: string, fallback: string) => process.env[key] ?? fallback;

export async function seedCurricula(
  prisma: PrismaClient,
  academicYearId: string,
) {
  const name = e('SEED_CURRICULUM_NAME', 'Merdeka');
  let curriculum = await prisma.curricula.findFirst({
    where: { name, academicYearId, deletedAt: null },
  });
  if (!curriculum) {
    curriculum = await prisma.curricula.create({
      data: { name, academicYearId },
    });
    console.log(`  [curricula] created: ${name}`);
  } else {
    console.log(`  [curricula] already exists: ${name}`);
  }
  return curriculum;
}
