import { AssessmentType, PrismaClient } from '@prisma/client';

interface AssessmentTemplate {
  name: string;
  type: AssessmentType;
  weight: number;
  maxScore: number;
}

const DEFAULT_ASSESSMENTS: AssessmentTemplate[] = [
  {
    name: 'Tugas Harian 1',
    type: AssessmentType.DAILY,
    weight: 1,
    maxScore: 100,
  },
  {
    name: 'Tugas Harian 2',
    type: AssessmentType.DAILY,
    weight: 1,
    maxScore: 100,
  },
  {
    name: 'Ujian Tengah Semester',
    type: AssessmentType.MIDTERM,
    weight: 2,
    maxScore: 100,
  },
  {
    name: 'Ujian Akhir Semester',
    type: AssessmentType.FINAL,
    weight: 3,
    maxScore: 100,
  },
];

export async function seedAssessmentItems(
  prisma: PrismaClient,
  teachingAssignments: { id: string }[],
) {
  if (teachingAssignments.length === 0) {
    console.log('  [assessment-item] ⚠ no teaching assignments, skip');
    return [];
  }

  let created = 0;
  const items: {
    id: string;
    teachingAssignmentId: string;
    type: AssessmentType;
  }[] = [];

  for (const ta of teachingAssignments) {
    for (const template of DEFAULT_ASSESSMENTS) {
      const exists = await prisma.assessmentItem.findFirst({
        where: {
          teachingAssignmentId: ta.id,
          name: template.name,
          deletedAt: null,
        },
      });

      if (!exists) {
        const item = await prisma.assessmentItem.create({
          data: {
            teachingAssignmentId: ta.id,
            name: template.name,
            type: template.type,
            weight: template.weight,
            maxScore: template.maxScore,
          },
        });
        items.push({
          id: item.id,
          teachingAssignmentId: ta.id,
          type: item.type,
        });
        created++;
      } else {
        items.push({
          id: exists.id,
          teachingAssignmentId: ta.id,
          type: exists.type,
        });
      }
    }
  }

  console.log(`  [assessment-item] ${created} created, ${items.length} total`);
  return items;
}
