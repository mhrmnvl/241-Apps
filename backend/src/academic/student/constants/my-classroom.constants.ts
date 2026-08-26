/**
 * How many classmates one class read carries.
 *
 * A ceiling rather than a page size: a class is bounded by the room it sits
 * in, and a student looking at their own class expects all of it on one
 * screen. Forty is roughly double the largest class this school runs.
 */
export const CLASSMATE_LIMIT = 40;

/**
 * How many subjects one class read carries.
 *
 * A ceiling, like the classmate one: a curriculum is bounded by the week it
 * has to fit into. The school teaches twenty-seven.
 */
export const SUBJECT_LIMIT = 60;
