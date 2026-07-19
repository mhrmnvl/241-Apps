import { PrismaClient } from '@prisma/client';

export async function seedTeachingAssignments(
  prisma: PrismaClient,
  classrooms: { id: string; code: string }[],
  teachers: { id: string }[],
  semesterId: string,
) {
  if (teachers.length === 0 || classrooms.length === 0) {
    console.log('  [teaching-assignment] ⚠ no teachers or classrooms, skip');
    return [];
  }

  const subjects = await prisma.subject.findMany({
    where: { deletedAt: null },
    select: { id: true, name: true },
  });

  if (subjects.length === 0) {
    console.log('  [teaching-assignment] ⚠ no subjects found, skip');
    return [];
  }

  let created = 0;
  const assignments: {
    id: string;
    classroomId: string;
    subjectName: string;
  }[] = [];
  let empIdx = 0;

  for (const cls of classrooms) {
    for (const subject of subjects) {
      const teacher = teachers[empIdx % teachers.length];
      empIdx++;

      const exists = await prisma.teachingAssignment.findFirst({
        where: {
          classroomId: cls.id,
          subjectId: subject.id,
          semesterId,
          deletedAt: null,
        },
      });

      if (!exists) {
        const ta = await prisma.teachingAssignment.create({
          data: {
            teacherId: teacher.id,
            classroomId: cls.id,
            subjectId: subject.id,
            semesterId,
          },
        });
        assignments.push({
          id: ta.id,
          classroomId: cls.id,
          subjectName: subject.name,
        });
        created++;
      } else {
        assignments.push({
          id: exists.id,
          classroomId: cls.id,
          subjectName: subject.name,
        });
      }
    }
  }

  console.log(
    `  [teaching-assignment] ${created} created, ${assignments.length} total`,
  );
  return assignments;
}
