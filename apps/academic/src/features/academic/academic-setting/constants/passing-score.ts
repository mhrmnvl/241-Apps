/**
 * Bounds on a pass mark, mirroring the API's own validation so the message
 * lands on the field instead of arriving as a rejected request.
 *
 * The floor is 1 rather than 0: a pass mark of zero passes everyone, including
 * a student who sat no assessment. That is a cleared field saved by accident,
 * not a policy a school means to set.
 */
export const PASSING_SCORE_MIN = 1
export const PASSING_SCORE_MAX = 100

/** Shown before the real setting arrives, and matches the column default. */
export const FALLBACK_PASSING_SCORE = 75
