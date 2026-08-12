/**
 * Upper bound on the enrolments a single bulk generation walks.
 *
 * One classroom for one semester, so this is a guard against a malformed
 * query rather than a page size any real class approaches.
 */
export const BULK_GENERATE_ENROLLMENT_LIMIT = 200;

/**
 * Used only when a subject has been taught and graded but never listed in the
 * curriculum for that grade and year, so no pass mark exists to read.
 *
 * That is a data gap, not a normal state — grading through it beats refusing
 * to produce the report card, and the frozen line records the figure used.
 */
export const DEFAULT_PASSING_SCORE = 75;
