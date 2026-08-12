/**
 * Upper bound on the enrolments a single bulk generation walks.
 *
 * One classroom for one semester, so this is a guard against a malformed
 * query rather than a page size any real class approaches.
 */
export const BULK_GENERATE_ENROLLMENT_LIMIT = 200;
