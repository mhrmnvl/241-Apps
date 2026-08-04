import { EnrollmentStatus, Prisma } from '@prisma/client';
import {
  RolloverResult,
  RolloverSourceData,
} from '../../domain/interfaces/rollover-repository.interface.js';

/**
 * The four copy steps of a semester rollover, in the order they must run.
 *
 * Every step is idempotent: it looks for an existing row first and counts it as
 * `skipped` instead of inserting a duplicate, so re-running a partially
 * completed rollover is safe. Classrooms and teaching assignments also return
 * an old-id → new-id map, because the steps that follow them re-point their
 * foreign keys at the freshly created rows.
 */

export function emptyRolloverResult(): RolloverResult {
  return {
    classrooms: { created: 0, skipped: 0 },
    enrollments: { created: 0, skipped: 0 },
    supervisors: { created: 0, skipped: 0 },
    teachingAssignments: { created: 0, skipped: 0 },
    schedules: { created: 0, skipped: 0 },
  };
}

/** Step 1 — clone each classroom into the target academic year. */
export async function copyClassrooms(
  tx: Prisma.TransactionClient,
  classrooms: RolloverSourceData['classrooms'],
  targetAcademicYearId: string,
  result: RolloverResult,
): Promise<Map<string, string>> {
  const classroomIdMap = new Map<string, string>();

  for (const classroom of classrooms) {
    const existing = await tx.classroom.findFirst({
      where: {
        academicYearId: targetAcademicYearId,
        gradeId: classroom.gradeId,
        code: classroom.code,
        deletedAt: null,
      },
    });

    if (existing) {
      classroomIdMap.set(classroom.id, existing.id);
      result.classrooms.skipped++;
      continue;
    }

    const created = await tx.classroom.create({
      data: {
        academicYearId: targetAcademicYearId,
        gradeId: classroom.gradeId,
        code: classroom.code,
        name: classroom.name,
        capacity: classroom.capacity,
        isActive: classroom.isActive,
      },
    });
    classroomIdMap.set(classroom.id, created.id);
    result.classrooms.created++;
  }

  return classroomIdMap;
}

/** Step 2 — re-enrol every active student into the cloned classroom. */
export async function copyEnrollments(
  tx: Prisma.TransactionClient,
  enrollments: RolloverSourceData['enrollments'],
  classroomIdMap: Map<string, string>,
  targetSemesterId: string,
  result: RolloverResult,
): Promise<void> {
  for (const enrollment of enrollments) {
    const newClassroomId = classroomIdMap.get(enrollment.classroomId);
    if (!newClassroomId) continue;

    const existing = await tx.studentEnrollment.findFirst({
      where: {
        studentId: enrollment.studentId,
        semesterId: targetSemesterId,
        deletedAt: null,
      },
    });

    if (existing) {
      result.enrollments.skipped++;
      continue;
    }

    await tx.studentEnrollment.create({
      data: {
        studentId: enrollment.studentId,
        classroomId: newClassroomId,
        semesterId: targetSemesterId,
        status: EnrollmentStatus.ACTIVE,
      },
    });
    result.enrollments.created++;
  }
}

/** Step 3 — carry each homeroom teacher over to the cloned classroom. */
export async function copySupervisors(
  tx: Prisma.TransactionClient,
  supervisors: RolloverSourceData['supervisors'],
  classroomIdMap: Map<string, string>,
  targetSemesterId: string,
  result: RolloverResult,
): Promise<void> {
  for (const supervisor of supervisors) {
    const newClassroomId = classroomIdMap.get(supervisor.classroomId);
    if (!newClassroomId) continue;

    const existing = await tx.classroomSupervisor.findFirst({
      where: {
        classroomId: newClassroomId,
        semesterId: targetSemesterId,
        deletedAt: null,
      },
    });

    if (existing) {
      result.supervisors.skipped++;
      continue;
    }

    await tx.classroomSupervisor.create({
      data: {
        classroomId: newClassroomId,
        teacherId: supervisor.teacherId,
        semesterId: targetSemesterId,
      },
    });
    result.supervisors.created++;
  }
}
