import type { AcademicYearRef } from '../types'

export interface DerivedPromotionYears {
  /** The year the school is in. Null when none is active. */
  source: AcademicYearRef | null
  /** The year that follows it. Null when it has not been created yet. */
  target: AcademicYearRef | null
}

/**
 * Which years a promotion runs between, worked out rather than asked.
 *
 * A promotion always moves students out of the year the school is in and into
 * the one after it, so making an operator name both was asking them to restate
 * something already recorded — and giving them a way to get it wrong.
 *
 * Ordered by `startYear`, never by name. Academic years are master data the
 * school renames, and a rename that reordered them would move a whole cohort
 * into the wrong year without anything looking broken.
 *
 * The target is the year that starts exactly one year later, not merely the
 * next one on record. A school whose next year is 2030/2031 has a gap, and
 * quietly promoting into it would be a worse answer than saying 2027/2028 does
 * not exist yet.
 */
export function derivePromotionYears(
  years: AcademicYearRef[],
): DerivedPromotionYears {
  const source = years.find((year) => year.isActive) ?? null
  if (source?.startYear === undefined) {
    return { source, target: null }
  }

  const nextStart = source.startYear + 1
  const target = years.find((year) => year.startYear === nextStart) ?? null

  return { source, target }
}
