import type { AcademicYearRef } from '../types'

/**
 * The years a promotion is allowed to move students *into*.
 *
 * A promotion goes forward. The manual override existed so a school that ran a
 * year late could catch up — 2025/2026 into 2026/2027 — and it filtered the
 * list only by "not the source year", which left every earlier year on offer
 * too. Choosing one sends a cohort backwards: 2027/2028 into 2026/2027.
 *
 * Nothing downstream catches that. The server checks the *grade* goes up and
 * that both classrooms belong to the years named, and a backward promotion
 * satisfies both — VII of 2027/2028 into VIII of 2026/2027 is a valid-looking
 * request. It would close this year's enrolments and open new ones in a year
 * that has already finished, which is not something a screen can undo.
 *
 * So the guard belongs here, where the choice is offered rather than where it
 * is executed.
 *
 * Ordered by `startYear`, never by name: academic years are master data the
 * school renames, and a rename that reordered them would silently change which
 * years are on offer. A source year with no `startYear` yields nothing rather
 * than everything — an unknown position cannot establish what comes after it.
 */
export function selectableTargetYears(
  years: AcademicYearRef[],
  sourceAcademicYearId: string | null | undefined,
): AcademicYearRef[] {
  if (!sourceAcademicYearId) return []

  const source = years.find((year) => year.id === sourceAcademicYearId)
  if (source?.startYear === undefined) return []

  return years
    .filter((year) => year.startYear !== undefined)
    .filter((year) => year.startYear! > source.startYear!)
    .sort((a, b) => a.startYear! - b.startYear!)
}
