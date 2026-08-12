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

export type ReferenceListStatus = 'idle' | 'loading' | 'ready' | 'failed'

/** One held list. `items` is deliberately opaque — the cache never inspects it. */
export interface CachedList<T = unknown> {
  key: ReferenceListKey
  items: T[]
  fetchedAt: number
  status: ReferenceListStatus
}
