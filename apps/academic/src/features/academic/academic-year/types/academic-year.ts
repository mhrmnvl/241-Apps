export interface AcademicYear {
  id: string
  name: string
  isActive: boolean
  /**
   * Weekdays school does not run, 0 (Sunday) to 6 (Saturday).
   *
   * A rule, not a set of dates: the calendar applies it when rendering rather
   * than holding an entry for every Sunday of the year.
   */
  weeklyHolidays: number[]
  deletedAt?: string | null
}
