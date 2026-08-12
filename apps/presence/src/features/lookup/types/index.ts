/**
 * Narrow read models for the academic data this app displays but does not own.
 *
 * Each one names only the fields presence and payroll actually read. That is
 * deliberate: academic-web's `Teacher` and `Student` carry dozens of fields
 * this app has no business knowing about, and mirroring them here would turn
 * every academic schema change into a change in two apps.
 */

/** A person who can hold a credential, a work pattern, or a salary. */
export interface PersonOption {
  userId: string
  name: string
  /** NIP where the person has one, else the account's login identifier. */
  identifier: string
}

export interface AcademicYearOption {
  id: string
  name: string
  isActive: boolean
}

export interface CalendarTypeOption {
  id: string
  name: string
}

/** One academic-calendar entry, before it is expanded into single dates. */
export interface CalendarEntry {
  id: string
  title: string
  startDate: string
  endDate: string
}
