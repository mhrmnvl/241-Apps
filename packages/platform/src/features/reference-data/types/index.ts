/**
 * The lists a user picks from, as opposed to the records they work on.
 *
 * A key is one list, not one screen: the same academic years are shown by the
 * classroom manager, the schedule and the report card, and holding them once is
 * the whole point.
 *
 * **A key identifies a query, not an entity.** Two reads of the same table with
 * different parameters are two lists and must not share a key — the second
 * would be served the first one's rows. That is why `teachers` (all of them, as
 * academic reads them) and `employees` (the active ones, as presence reads
 * them) are separate entries rather than one.
 *
 * Caches are per origin, so five applications hold five of these. Sharing a
 * name across apps costs nothing; sharing one *within* an app is the bug.
 */
export type ReferenceListKey =
  // Academic
  | 'academicYears'
  | 'semesters'
  | 'classrooms'
  | 'subjects'
  | 'grades'
  | 'teachers'
  | 'positions'
  | 'positionCategories'
  | 'employmentTypes'
  | 'religions'
  | 'bloodTypes'
  | 'occupations'
  | 'educationLevels'
  // Presence — the lookup layer's read models (ADR-0009)
  | 'employees'
  | 'students'
  | 'calendarTypes'
  // Inventory
  | 'inventoryMetadata'
  // Admission
  | 'admissionWaves'
  // Portal
  | 'portalCategories'
  | 'portalPublicCategories'

/**
 * Our four words for what TanStack Query reports as `status` plus
 * `fetchStatus`, kept so a caller can ask "is this list loading" without
 * learning that vocabulary.
 */
export type ReferenceListStatus = 'idle' | 'loading' | 'ready' | 'failed'
