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

  // Presence reads people through its lookup layer, filtered to the active
  // ones. Same volatility as the academic roster, different query.
  employees: 5 * MINUTE,
  students: 5 * MINUTE,
  calendarTypes: 60 * MINUTE,

  // Inventory's categories, conditions and locations arrive as one bundle from
  // `/inventory/metadata`, and are edited while the asset register is set up.
  inventoryMetadata: 10 * MINUTE,

  // Admission waves change at the boundaries of an intake, not during one.
  admissionWaves: 30 * MINUTE,

  portalCategories: 10 * MINUTE,
  portalPublicCategories: 10 * MINUTE,
}
