import { PrismaClient } from '@prisma/client';

export async function seedClassSupervisors(
  prisma: PrismaClient,
  classrooms: { id: string; code: string }[],
  teachers: { id: string }[],
  semesterId: string,
) {
  if (teachers.length === 0 || classrooms.length === 0) {
    console.log('  [class-supervisor] ⚠ no teachers or classrooms, skip');
    return;
  }

  let created = 0;
  for (let i = 0; i < classrooms.length; i++) {
    const teacher = teachers[i % teachers.length];
    const cls = classrooms[i];

    const exists = await prisma.classroomSupervisor.findFirst({
      where: { classroomId: cls.id, semesterId, deletedAt: null },
    });
    if (!exists) {
      await prisma.classroomSupervisor.create({
        data: { classroomId: cls.id, teacherId: teacher.id, semesterId },
      });
      created++;
    }
  }
  console.log(`  [class-supervisor] ${created} created`);
}
