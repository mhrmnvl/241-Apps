import { Prisma } from '@prisma/client';
import { AttendanceQueryInput } from '../../domain/interfaces/attendance-repository.interface.js';

/**
 * Where-clause for the paginated attendance list.
 *
 * The semester scope is only applied when the caller has not already pinned a
 * single enrolment or schedule, and it matches either side of the record —
 * attendance can be reached through the enrolment's semester or through the
 * schedule's teaching assignment.
 */
export function buildAttendanceListWhere(
  query: AttendanceQueryInput,
  resolvedSemesterId?: string | null,
): Prisma.AttendanceWhereInput {
  const { enrollmentId, scheduleId, classroomId, status, date } = query;

  return {
    deletedAt: null,
    enrollment: {},
    ...(enrollmentId && { enrollmentId }),
    ...(scheduleId && { scheduleId }),
    ...(status && { status }),
    ...(date && { date: new Date(date) }),
    ...(classroomId && {
      enrollment: { classroomId, deletedAt: null },
    }),
    ...(resolvedSemesterId &&
      !enrollmentId &&
      !scheduleId && {
        OR: [
          { enrollment: { semesterId: resolvedSemesterId } },
          {
            schedule: {
              teachingAssignment: { semesterId: resolvedSemesterId },
            },
          },
        ],
      }),
  };
}
