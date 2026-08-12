/**
 * The lists a user picks from, as opposed to the records they work on.
 *
 * A key is one list, not one screen: the same academic years are shown by the
 * classroom manager, the schedule and the report card, and holding them once is
 * the whole point.
 */
export type ReferenceListKey =
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

/**
 * Our four words for what TanStack Query reports as `status` plus
 * `fetchStatus`, kept so a caller can ask "is this list loading" without
 * learning that vocabulary.
 */
export type ReferenceListStatus = 'idle' | 'loading' | 'ready' | 'failed'
