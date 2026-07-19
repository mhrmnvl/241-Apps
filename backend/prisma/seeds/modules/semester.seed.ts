import { PrismaClient } from '@prisma/client';

export async function seedSemesters(
  prisma: PrismaClient,
  academicYearId: string,
) {
  const types = await prisma.semesterType.findMany({
    where: { isActive: true, deletedAt: null },
  });
  const results: { id: string; typeName: string }[] = [];

  for (const semesterType of types) {
    let semester = await prisma.semester.findFirst({
      where: { academicYearId, typeId: semesterType.id, deletedAt: null },
    });

    if (!semester) {
      const isActive = semesterType.name === 'EVEN';

      if (isActive) {
        await prisma.semester.updateMany({
          where: { isActive: true },
          data: { isActive: false },
        });
      }

      semester = await prisma.semester.create({
        data: { academicYearId, typeId: semesterType.id, isActive },
      });
      console.log(
        `  [semester] created: ${semesterType.name}${isActive ? ' (active)' : ''}`,
      );
    } else {
      console.log(`  [semester] already exists: ${semesterType.name}`);
    }

    results.push({ id: semester.id, typeName: semesterType.name });
  }

  return results;
}
