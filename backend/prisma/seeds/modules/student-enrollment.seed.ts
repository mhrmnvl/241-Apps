import { EnrollmentStatus, PrismaClient } from '@prisma/client';

export async function seedStudentEnrollments(
  prisma: PrismaClient,
  semesterId: string,
  classrooms: { id: string; gradeId: string }[],
) {
  const students = await prisma.student.findMany({
    where: { deletedAt: null, status: 'ACTIVE' },
    select: { id: true, gradeId: true },
  });

  let created = 0;
  const enrollments: { id: string; classroomId: string }[] = [];

  for (const student of students) {
    const targetClass = classrooms.find((c) => c.gradeId === student.gradeId);
    if (!targetClass) continue;

    const exists = await prisma.studentEnrollment.findFirst({
      where: { studentId: student.id, semesterId, deletedAt: null },
    });
    if (!exists) {
      const enrollment = await prisma.studentEnrollment.create({
        data: {
          studentId: student.id,
          classroomId: targetClass.id,
          semesterId,
          status: EnrollmentStatus.ACTIVE,
        },
      });
      enrollments.push({ id: enrollment.id, classroomId: targetClass.id });
      created++;
    } else {
      enrollments.push({ id: exists.id, classroomId: targetClass.id });
    }
  }
  console.log(
    `  [student-enrollment] ${created} created, ${enrollments.length} total`,
  );
  return enrollments;
}
