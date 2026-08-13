import { EnrollmentStatus, Prisma, StudentStatus } from '@prisma/client';

/**
 * What it means to graduate a student, in one place.
 *
 * Three paths reach this: the single record, the bulk run, and — until it was
 * separated out — the promotion flow. Those first two used to be written
 * independently, and they disagreed: one closed the student's enrolment and the
 * other left it open, so an alumnus stayed on their old class roster forever.
 *
 * Whatever graduating means, it means the same thing every time, which is why
 * this is a function rather than a comment asking three call sites to remember.
 */
export interface GraduateStudentInput {
  studentId: string;
  academicYearId: string;
  graduationDate?: Date;
  certificateNo?: string;
  note?: string;
}

export async function graduateStudentSteps(
  tx: Prisma.TransactionClient,
  input: GraduateStudentInput,
): Promise<string> {
  const graduation = await tx.studentGraduation.create({
    data: {
      studentId: input.studentId,
      academicYearId: input.academicYearId,
      ...(input.graduationDate && { graduationDate: input.graduationDate }),
      ...(input.certificateNo && { certificateNo: input.certificateNo }),
      ...(input.note && { note: input.note }),
    },
    select: { id: true },
  });

  await tx.student.update({
    where: { id: input.studentId },
    data: { status: StudentStatus.GRADUATED },
  });

  // Leaving the school closes the enrolment. Without this the student keeps
  // appearing in their old classroom's roster, attendance and grading lists.
  await tx.studentEnrollment.updateMany({
    where: {
      studentId: input.studentId,
      status: EnrollmentStatus.ACTIVE,
      deletedAt: null,
    },
    data: {
      status: EnrollmentStatus.GRADUATED,
      endedAt: input.graduationDate ?? new Date(),
    },
  });

  return graduation.id;
}
