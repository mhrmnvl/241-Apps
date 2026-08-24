import type { Semester } from '../types'

export interface RolloverSuggestion {
  /** The term that has the data. */
  source: Semester
  /** The term that has none, which is the one just activated. */
  target: Semester
}

/**
 * Whether a term that was just activated should be offered its sibling's data.
 *
 * A rollover is easy to forget, and forgetting it does not look like a missed
 * step — it looks like a broken screen. Genap exists, it is active, and every
 * list scoped to the active term comes back empty. That has now been the cause
 * of two separate "nothing is showing" reports.
 *
 * So the offer is made where the omission happens, at the moment it happens,
 * rather than waiting for somebody to find the Rollover dialog.
 *
 * Suggested only when all of these hold:
 *
 *   - the activated term has no enrolments, so nothing can be overwritten
 *   - a sibling term of the same year has some, so there is something to copy
 *   - exactly one sibling qualifies, so the answer is not a guess
 *
 * Returns null otherwise, which includes the ordinary case of a term that was
 * activated because it is already in use.
 */
export function suggestRollover(
  activated: Semester | null | undefined,
  semesters: Semester[],
): RolloverSuggestion | null {
  if (!activated) return null

  // Counting is the server's; a term whose count did not arrive is not
  // assumed empty, because offering to fill a term that already holds a
  // year of marks is a worse mistake than staying quiet.
  const enrolments = activated._count?.enrollments
  if (enrolments === undefined || enrolments > 0) return null

  const populatedSiblings = semesters.filter(
    (candidate) =>
      candidate.id !== activated.id &&
      candidate.academicYearId === activated.academicYearId &&
      (candidate._count?.enrollments ?? 0) > 0,
  )

  // Two siblings with data is a question, not an answer — and a school with a
  // third term is exactly the case that should be asked rather than guessed.
  if (populatedSiblings.length !== 1) return null

  return { source: populatedSiblings[0], target: activated }
}
