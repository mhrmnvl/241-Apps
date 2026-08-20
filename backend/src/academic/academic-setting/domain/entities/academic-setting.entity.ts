/**
 * School-wide academic policy: how this school runs, rather than what happens
 * on any particular date.
 *
 * There is exactly one of these. The row is created by the migration and only
 * ever updated, so nothing here has to describe an absent settings record.
 */
export interface AcademicSettingEntity {
  id: string;
  /** Weekdays school does not run, 0 (Sunday) to 6 (Saturday). */
  weeklyHolidays: number[];
  createdAt: Date;
  updatedAt: Date;
}
