import type { ReferenceListKey } from '../types'

const MINUTE = 60_000

/**
 * How long each list may be trusted, derived from how often it actually
 * changes rather than from one uniform default.
 *
 * `Infinity` means "for as long as this session lasts" — a religion or a blood
 * type does not change while someone is signed in. Everything else is short
 * enough that a stale pick-list corrects itself before it can mislead: a
 * classroom created in another tab shows up within five minutes, and sooner
 * than that if the creating tab invalidates the list itself.
 */
export const REFERENCE_EXPIRY_MS: Record<ReferenceListKey, number> = {
  religions: Infinity,
  bloodTypes: Infinity,
  occupations: Infinity,
  educationLevels: Infinity,

  positions: 60 * MINUTE,
  positionCategories: 60 * MINUTE,
  employmentTypes: 60 * MINUTE,

  academicYears: 30 * MINUTE,
  semesters: 30 * MINUTE,

  subjects: 10 * MINUTE,
  grades: 10 * MINUTE,

  classrooms: 5 * MINUTE,
  teachers: 5 * MINUTE,
}
