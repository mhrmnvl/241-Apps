import { Day } from '@prisma/client';

/**
 * `Date.getDay()` counts Sunday as 0; the schedule's `Day` enum has no Sunday
 * at all, because no lesson has ever been timetabled on one.
 *
 * Indexed rather than computed so the absence of Sunday is visible: the hole at
 * position 0 is the statement.
 */
export const WEEKDAY_TO_SCHEDULE_DAY: readonly (Day | null)[] = [
  null,
  Day.MONDAY,
  Day.TUESDAY,
  Day.WEDNESDAY,
  Day.THURSDAY,
  Day.FRIDAY,
  Day.SATURDAY,
];

/** How many recent marks a student sees at a glance. */
export const LATEST_SCORE_LIMIT = 5;

/**
 * How many unfinished assessments a teacher sees at a glance.
 *
 * A ceiling on the panel, not on the work: the count of what is outstanding is
 * reported separately, so a teacher with twenty behind is told twenty rather
 * than shown five and left to assume that is all of it.
 */
export const UNGRADED_ASSESSMENT_LIMIT = 5;

/**
 * A single teacher's week, with room to spare — a timetable is bounded by the
 * days and periods in it, so this is a ceiling rather than a page size.
 */
export const SCHEDULE_CEILING = 200;
