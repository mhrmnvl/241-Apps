import { PrismaClient } from '@prisma/client';

export async function seedSemesterTypes(prisma: PrismaClient) {
  const types = ['ODD', 'EVEN'];
  const results: any[] = [];

  for (const name of types) {
    let semesterType = await prisma.semesterType.findUnique({
      where: { name },
    });

    if (!semesterType) {
      semesterType = await prisma.semesterType.create({
        data: { name, isActive: true },
      });
      console.log(`  [semester-type] created: ${name}`);
    } else {
      console.log(`  [semester-type] already exists: ${name}`);
    }

    results.push(semesterType);
  }

  return results;
}
