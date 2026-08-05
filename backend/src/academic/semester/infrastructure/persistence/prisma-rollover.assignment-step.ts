import { Prisma } from '@prisma/client';
import {
  RolloverResult,
  RolloverSourceData,
} from '../../domain/interfaces/rollover-repository.interface.js';

/**
 * Step 4 — clone teaching assignments and, for each one, its weekly schedule.
 * Schedules hang off the assignment, so they are copied in the same pass.
 */
export async function copyAssignmentsWithSchedules(
  tx: Prisma.TransactionClient,
  assignments: RolloverSourceData['assignments'],
  classroomIdMap: Map<string, string>,
  targetSemesterId: string,
  result: RolloverResult,
): Promise<void> {
  for (const assignment of assignments) {
    const newClassroomId = classroomIdMap.get(assignment.classroomId);
    if (!newClassroomId) continue;

    const existing = await tx.teachingAssignment.findFirst({
      where: {
        teacherId: assignment.teacherId,
        classroomId: newClassroomId,
        subjectId: assignment.subjectId,
        semesterId: targetSemesterId,
        deletedAt: null,
      },
    });

    let newAssignmentId: string;
    if (existing) {
      newAssignmentId = existing.id;
      result.teachingAssignments.skipped++;
    } else {
      const created = await tx.teachingAssignment.create({
        data: {
          teacherId: assignment.teacherId,
          classroomId: newClassroomId,
          subjectId: assignment.subjectId,
          semesterId: targetSemesterId,
        },
      });
      newAssignmentId = created.id;
      result.teachingAssignments.created++;
    }

    for (const schedule of assignment.schedules) {
      const existingSchedule = await tx.schedule.findFirst({
        where: {
          teachingAssignmentId: newAssignmentId,
          day: schedule.day,
          timeSlotId: schedule.timeSlotId,
          deletedAt: null,
        },
      });

      if (existingSchedule) {
        result.schedules.skipped++;
        continue;
      }

      await tx.schedule.create({
        data: {
          teachingAssignmentId: newAssignmentId,
          timeSlotId: schedule.timeSlotId,
          day: schedule.day,
          room: schedule.room,
        },
      });
      result.schedules.created++;
    }
  }
}
