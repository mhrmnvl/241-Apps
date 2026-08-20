/**
 * Weekdays, numbered the way the rest of the system numbers them: 0 is Sunday
 * through 6 is Saturday, matching `Date.getDay()` and `work_pattern_days`.
 *
 * ISO-8601 counts Monday as 1 and Sunday as 7, which is just as standard and
 * would be just as plausible to a reader — so the convention is stated once
 * here and everything else reads it from this list rather than counting.
 */
export const WEEKDAYS = [
  { value: 0, short: 'Min', label: 'Minggu' },
  { value: 1, short: 'Sen', label: 'Senin' },
  { value: 2, short: 'Sel', label: 'Selasa' },
  { value: 3, short: 'Rab', label: 'Rabu' },
  { value: 4, short: 'Kam', label: 'Kamis' },
  { value: 5, short: 'Jum', label: "Jum'at" },
  { value: 6, short: 'Sab', label: 'Sabtu' },
] as const

/**
 * Sunday, which is what this school has closed on since the work pattern was
 * seeded. Used for a new year that states no rule of its own — the column
 * carries the same default, so the two agree.
 */
export const DEFAULT_WEEKLY_HOLIDAY = 0

/**
 * Whether a date falls on one of the school's weekly holidays.
 *
 * The rule is held once on the academic year and applied here, so no entry is
 * ever written for a Sunday and none can go stale when the rule changes.
 */
export function isWeeklyHoliday(
  date: Date,
  weeklyHolidays: readonly number[],
): boolean {
  return weeklyHolidays.includes(date.getDay())
}

/** Reads the rule back in the order of the week, for a label. */
export function formatWeeklyHolidays(
  weeklyHolidays: readonly number[],
): string {
  const named = WEEKDAYS.filter((day) =>
    weeklyHolidays.includes(day.value),
  ).map((day) => day.label)

  return named.length > 0 ? named.join(', ') : 'Tidak ada'
}
