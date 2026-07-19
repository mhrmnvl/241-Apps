import { PrismaClient } from '@prisma/client';

export async function seedReportCards(
  prisma: PrismaClient,
  enrollments: { id: string }[],
) {
  if (enrollments.length === 0) {
    console.log('  [report-card] ⚠ no enrollments, skip');
    return;
  }

  let created = 0;
  for (const enrollment of enrollments) {
    const exists = await prisma.reportCard.findFirst({
      where: {
        enrollmentId: enrollment.id,
        deletedAt: null,
      },
    });

    if (!exists) {
      await prisma.reportCard.create({
        data: {
          enrollmentId: enrollment.id,
          totalAverage: null,
          rank: null,
          teacherNote: null,
          isPublished: false,
        },
      });
      created++;
    }
  }

  console.log(`  [report-card] ${created} created (draft/unpublished)`);
}
