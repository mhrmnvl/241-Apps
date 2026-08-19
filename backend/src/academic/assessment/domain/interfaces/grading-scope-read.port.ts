/**
 * What a teacher is allowed to grade, read from records rather than roles.
 *
 * Two reaches, and they are different shapes:
 *
 *   - the subjects they are **assigned to teach**, in whichever classrooms they
 *     teach them — a teaching assignment;
 *   - the classroom they **supervise** as its homeroom teacher, across every
 *     subject in it — a supervisor row.
 *
 * Neither is a role. `SARPRAS`, `Guru Honorer` and `Wali Kelas` are all names
 * this school has given roles, and `teacher-identity-read.port.ts` records what
 * happened when the frontend compared roles to the literal `TEACHER`: a teacher
 * with a custom role was shown the administrator's screen instead of their own.
 * A teaching assignment does not care what the role is called, and neither does
 * a supervisor row.
 *
 * Kept in `assessment/` because grading is what asks the question. The rows
 * belong to `academic/`'s own modules, and the adapter reads them there.
 */
export abstract class IGradingScopeReadPort {
  /**
   * Whether this teacher holds the assignment that owns the assessment item.
   *
   * The subject teacher's own reach: their marks, their class, their subject.
   */
  abstract teachesAssessmentItem(
    teacherId: string,
    assessmentItemId: string,
  ): Promise<boolean>;

  /**
   * Whether this teacher supervises the classroom the enrolment sits in, for
   * the semester the enrolment belongs to.
   *
   * The homeroom teacher's reach. Scoped to the semester because supervision is
   * — `ClassroomSupervisor` is unique per classroom *and* semester, so last
   * year's homeroom teacher is not this year's.
   */
  abstract supervisesEnrollment(
    teacherId: string,
    enrollmentId: string,
  ): Promise<boolean>;
}
