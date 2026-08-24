// The domain enum, not Prisma's: the query input is typed against this one.
import { EnrollmentStatus } from '../../../../shared/domain/enums/enrollment-status.enum.js';
import { buildEnrollmentListWhere } from './prisma-enrollment.queries.js';

/**
 * What scopes an enrolment list, and why a student counts as one.
 *
 * `findAll` falls back to the active semester when nothing scopes the query,
 * so the list is not an unbounded read across every year. That fallback is
 * right for an unfiltered list and wrong for one student: it narrowed a
 * request for their history down to the current term and returned the single
 * row the caller already had, which is why nothing in the app could show a
 * student's past classes — or the note recorded when they were held back.
 *
 * These pin the filter itself. The scope decision lives in the repository
 * beside the fallback it guards.
 */
describe('buildEnrollmentListWhere', () => {
  it('always excludes soft-deleted rows', () => {
    expect(buildEnrollmentListWhere({})).toEqual({ deletedAt: null });
  });

  it('filters by student', () => {
    expect(buildEnrollmentListWhere({ studentId: 'stu-1' })).toEqual({
      deletedAt: null,
      studentId: 'stu-1',
    });
  });

  /**
   * A student's history is every term they have been here, so the resolved
   * term must not be applied on top of it. The repository is what decides not
   * to resolve one; this proves the filter honours that.
   */
  it('leaves the term open when none was resolved', () => {
    const where = buildEnrollmentListWhere({ studentId: 'stu-1' }, undefined);

    expect(where).not.toHaveProperty('semesterId');
  });

  it('applies a resolved term when there is one', () => {
    expect(buildEnrollmentListWhere({ studentId: 'stu-1' }, 'sem-1')).toEqual({
      deletedAt: null,
      studentId: 'stu-1',
      semesterId: 'sem-1',
    });
  });

  it('reaches an academic year through the term rather than the enrolment', () => {
    expect(buildEnrollmentListWhere({ academicYearId: 'ay-1' })).toEqual({
      deletedAt: null,
      semester: { academicYearId: 'ay-1' },
    });
  });

  it('combines what it is given', () => {
    expect(
      buildEnrollmentListWhere(
        {
          studentId: 'stu-1',
          classroomId: 'cls-1',
          status: EnrollmentStatus.REPEATED,
        },
        'sem-1',
      ),
    ).toEqual({
      deletedAt: null,
      studentId: 'stu-1',
      classroomId: 'cls-1',
      status: EnrollmentStatus.REPEATED,
      semesterId: 'sem-1',
    });
  });
});
