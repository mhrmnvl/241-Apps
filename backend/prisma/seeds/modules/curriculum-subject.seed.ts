import { PrismaClient } from '@prisma/client';

const e = (key: string, fallback: string) => process.env[key] ?? fallback;

export async function seedCurriculumSubjects(
  prisma: PrismaClient,
  curriculumId: string,
) {
  const hoursPerWeek = parseInt(e('SEED_CURRICULUM_SUBJECT_HOURS', '2'), 10);

  const subjects = await prisma.subject.findMany({
    where: { deletedAt: null },
  });
  const levels = await prisma.grade.findMany({
    orderBy: { level: 'asc' },
  });

  let created = 0;
  for (const level of levels) {
    for (const subject of subjects) {
      const exists = await prisma.curriculumSubject.findFirst({
        where: {
          curriculumId,
          gradeId: level.id,
          subjectId: subject.id,
          deletedAt: null,
        },
      });
      if (!exists) {
        await prisma.curriculumSubject.create({
          data: {
            curriculumId,
            gradeId: level.id,
            subjectId: subject.id,
            hoursPerWeek,
          },
        });
        created++;
      }
    }
  }
  console.log(
    `  [curriculum-subject] ${created} created, ${subjects.length} subjects × ${levels.length} levels`,
  );
}
