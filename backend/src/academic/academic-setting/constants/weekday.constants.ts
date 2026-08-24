/**
 * Weekday numbering shared with `WorkPatternDay.weekday` and JavaScript's
 * `Date.getDay()`: 0 is Sunday through 6 is Saturday.
 *
 * Written down here because the alternative — ISO-8601, where Monday is 1 and
 * Sunday is 7 — is equally standard and equally plausible to a reader. Two
 * columns in this database already count from Sunday, so a third convention
 * would only create a translation nobody remembers to apply.
 */
export const WEEKDAY_MIN = 0;
export const WEEKDAY_MAX = 6;

/** Seven distinct weekdays exist; a longer list can only be a duplicate. */
export const WEEKDAY_COUNT = 7;
