import {
  CLASSROOM_WITH_DETAILS_INCLUDE,
  classroomWithDetailsInclude,
} from './prisma-classroom.includes.js';

/**
 * The homeroom teacher on a classroom row must be the one for a single
 * semester.
 *
 * Left unscoped, the relation returns whichever assignment the database hands
 * back first — including one from two years ago — and `take: 1` makes that look
 * decisive. academic-web hit exactly this and tried to correct for it in the
 * browser by fetching every assignment ever made and picking a winner, which
 * failed silently once a classroom had no row for the current semester.
 *
 * `@@unique([classroomId, semesterId])` is what makes the scoped query exact:
 * with a semester fixed, at most one row can match, so `take: 1` is the
 * constraint restated rather than a guess.
 */
describe('classroom list include', () => {
  it('scopes the homeroom teacher to the resolved semester', () => {
    const include = classroomWithDetailsInclude('sem-1');

    expect(include.classroomSupervisors.where).toEqual({
      deletedAt: null,
      semesterId: 'sem-1',
    });
    expect(include.classroomSupervisors.take).toBe(1);
  });

  it('stays open when no semester resolves, rather than matching nothing', () => {
    const include = classroomWithDetailsInclude(null);

    expect(include.classroomSupervisors.where).toEqual({ deletedAt: null });
  });

  it('never reads a soft-deleted assignment', () => {
    for (const semesterId of ['sem-1', null, undefined]) {
      expect(
        classroomWithDetailsInclude(semesterId).classroomSupervisors.where,
      ).toMatchObject({ deletedAt: null });
    }
  });

  /**
   * The unscoped constant is the base the function narrows. If it ever grew a
   * semester of its own the two would disagree, and the function's `where`
   * would be the one that counts — quietly, in one of the two call sites.
   */
  it('leaves the base constant unscoped', () => {
    expect(CLASSROOM_WITH_DETAILS_INCLUDE.classroomSupervisors.where).toEqual({
      deletedAt: null,
    });
  });
});
