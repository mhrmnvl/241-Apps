import { EnrollmentStatus, Prisma, StudentStatus } from '@prisma/client';
import { PromotionAction } from '../../domain/enums/promotion-action.enum.js';
import {
  PromotionResult,
  StudentPromotionInput,
} from '../../domain/interfaces/promotion-repository.interface.js';

/**
 * What a promotion run does to a student: move them on, or hold them back.
 *
 * Both close the old enrolment the same way — status + `endedAt` + the decline
 * reason — and both open a fresh one in the new year, differing only in the
 * classroom and which counter is bumped. The step is a no-op (counted as
 * `skipped`) when it has already been applied, so a re-run cannot double-enrol
 * anyone.
 *
 * Graduating a student is no longer one of the outcomes here. It ends their
 * time at the school rather than moving them within it, and lives under
 * Kelulusan with its own permissions and its own record.
 */

interface ActiveEnrollment {
  id: string;
  studentId: string;
}

/**
 * Closes the old enrolment and opens one in the target classroom — the same
 * mechanics for PROMOTE (higher grade) and REPEAT (same grade), differing only
 * in the status stamped on the closed row and which counter is bumped.
 */
export async function moveStudentToTargetSemester(
  tx: Prisma.TransactionClient,
  enrollment: ActiveEnrollment,
  student: StudentPromotionInput,
  targetSemesterId: string,
  result: PromotionResult,
): Promise<void> {
  const existingEnrollment = await tx.studentEnrollment.findFirst({
    where: {
      studentId: enrollment.studentId,
      semesterId: targetSemesterId,
      deletedAt: null,
    },
  });

  if (existingEnrollment) {
    result.skipped++;
    return;
  }

  const isPromote = student.action === PromotionAction.PROMOTE;

  await tx.studentEnrollment.update({
    where: { id: enrollment.id },
    data: {
      status: isPromote ? EnrollmentStatus.PROMOTED : EnrollmentStatus.REPEATED,
      endedAt: new Date(),
      note: student.declineReason ?? null,
    },
  });

  await tx.studentEnrollment.create({
    data: {
      studentId: enrollment.studentId,
      classroomId: student.targetClassroomId!,
      semesterId: targetSemesterId,
      status: EnrollmentStatus.ACTIVE,
    },
  });

  // Keep Student.gradeId in sync with the classroom they've been
  // promoted/repeated into, so the "Tingkat" filter in the student list
  // reflects the current grade level without relying on enrollment-based
  // fallback. See ADR-0004.
  const targetClassroom = await tx.classroom.findFirst({
    where: { id: student.targetClassroomId! },
    select: { gradeId: true },
  });
  if (targetClassroom) {
    await tx.student.update({
      where: { id: enrollment.studentId },
      data: { gradeId: targetClassroom.gradeId },
    });
  }

  if (isPromote) {
    result.promoted++;
  } else {
    result.repeated++;
  }
}
