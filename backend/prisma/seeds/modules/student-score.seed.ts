import { PrismaClient } from '@prisma/client';

export async function seedStudentScores(
  prisma: PrismaClient,
  enrollments: { id: string; classroomId: string }[],
) {
  if (enrollments.length === 0) {
    console.log('  [student-score] ⚠ no enrollments, skip');
    return;
  }

  const itemsByClass = new Map<string, { id: string }[]>();
  for (const enrollment of enrollments) {
    if (itemsByClass.has(enrollment.classroomId)) continue;

    const taIds = await prisma.teachingAssignment.findMany({
      where: { classroomId: enrollment.classroomId, deletedAt: null },
      select: { id: true },
    });

    const assessmentItems = await prisma.assessmentItem.findMany({
      where: {
        teachingAssignmentId: { in: taIds.map((t) => t.id) },
        deletedAt: null,
      },
      select: { id: true },
    });

    itemsByClass.set(enrollment.classroomId, assessmentItems);
  }

  let created = 0;
  for (const enrollment of enrollments) {
    const items = itemsByClass.get(enrollment.classroomId) ?? [];

    for (const item of items) {
      const exists = await prisma.studentScore.findFirst({
        where: {
          enrollmentId: enrollment.id,
          assessmentItemId: item.id,
          deletedAt: null,
        },
      });

      if (!exists) {
        const score = Math.floor(Math.random() * 41) + 60;
        await prisma.studentScore.create({
          data: {
            enrollmentId: enrollment.id,
            assessmentItemId: item.id,
            score,
          },
        });
        created++;
      }
    }
  }

  console.log(`  [student-score] ${created} created`);
}
