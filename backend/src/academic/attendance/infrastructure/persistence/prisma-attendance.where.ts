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
  const { enrollmentId, scheduleId, classroomId, status, date, studentId } =
    query;

  return {
    deletedAt: null,
    enrollment: {},
    // The self-service scope goes in `AND`, not into `enrollment`, and that
    // placement is the whole guarantee. `enrollment` is rewritten wholesale a
    // few lines down when the caller supplies `classroomId`, so a scope merged
    // into it would be silently dropped by a query parameter — the caller
    // would name a classroom and receive it, in full.
    //
    // `AND` cannot be reached by anything the caller sends, and Prisma
    // combines it with the `OR` below rather than replacing it.
    ...(studentId && {
      AND: [{ enrollment: { studentId, deletedAt: null } }],
    }),
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
