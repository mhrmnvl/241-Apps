/**
 * Bounds on a pass mark, on the 0–100 scale every score in this system uses.
 *
 * The floor is 1 rather than 0: a pass mark of zero would mark every student as
 * passing including one who sat no assessment, which is not a policy any school
 * means to set — it is a cleared field saved by accident.
 */
export const PASSING_SCORE_MIN = 1;
export const PASSING_SCORE_MAX = 100;
