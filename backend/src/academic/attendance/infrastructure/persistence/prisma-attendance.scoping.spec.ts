import { buildAttendanceListWhere } from './prisma-attendance.where.js';

/**
 * The student scope has to survive every other filter in this builder.
 *
 * That is not a theoretical worry. The report-card repository had the same
 * shape — several filters spreading onto one relation key — and the last one
 * won, so `GET /rapors/me` returned the whole school to a student. The scope
 * was passed in correctly and discarded on the way to the query.
 *
 * This builder is more dangerous than that one: it rewrites `enrollment`
 * wholesale when the caller supplies `classroomId`. So the scope lives in
 * `AND`, where nothing the caller sends can reach it, and these tests exist to
 * hold that placement rather than to describe it.
 */
describe('attendance list scoping', () => {
  it('puts the student scope where a caller cannot overwrite it', () => {
    const where = buildAttendanceListWhere({ studentId: 'stu-1' }, null);

    expect(where.AND).toEqual([
      { enrollment: { studentId: 'stu-1', deletedAt: null } },
    ]);
  });

  /**
   * The attack the placement defends against: naming a classroom rewrites
   * `enrollment` entirely. If the scope lived in that object, this request
   * would return the classroom in full.
   */
  it('keeps the scope when a classroom filter rewrites the enrollment clause', () => {
    const where = buildAttendanceListWhere(
      { studentId: 'stu-1', classroomId: 'cls-9' },
      null,
    );

    expect(where.enrollment).toEqual({ classroomId: 'cls-9', deletedAt: null });
    expect(where.AND).toEqual([
      { enrollment: { studentId: 'stu-1', deletedAt: null } },
    ]);
  });

  it('keeps the scope alongside the semester clause, which uses OR', () => {
    const where = buildAttendanceListWhere({ studentId: 'stu-1' }, 'sem-1');

    expect(where.OR).toBeDefined();
    expect(where.AND).toEqual([
      { enrollment: { studentId: 'stu-1', deletedAt: null } },
    ]);
  });

  it('adds no scope when none is asked for', () => {
    const where = buildAttendanceListWhere({ classroomId: 'cls-9' }, null);

    expect(where.AND).toBeUndefined();
  });

  it('never reaches a soft-deleted enrolment through the scope', () => {
    const where = buildAttendanceListWhere({ studentId: 'stu-1' }, 'sem-1');

    expect(where.AND).toEqual([
      expect.objectContaining({
        enrollment: expect.objectContaining({ deletedAt: null }),
      }),
    ]);
  });
});
