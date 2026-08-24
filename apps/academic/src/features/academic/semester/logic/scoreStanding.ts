/**
 * Whether an average sits above or below the school's passing mark.
 *
 * The table used to colour this against a hardcoded 75. The school sets its own
 * KKM — there is a control for it under Pengaturan Akademik, and the curriculum
 * carries a per-subject one — so any year the default is not 75, the colour
 * disagreed with the school about who was struggling. It sat next to
 * Rekomendasi, which the server works out properly, and quietly offered a
 * second opinion computed from a number nobody chose.
 *
 * A missing score is not a low one. A student whose report card has not been
 * finalised has no average, and painting that amber would read as a warning
 * about a child nobody has marked yet.
 */
export type ScoreStanding = 'unknown' | 'below' | 'at-or-above'

export function scoreStanding(
  averageScore: number | null | undefined,
  passingScore: number | null | undefined,
): ScoreStanding {
  if (averageScore == null) return 'unknown'
  // No mark to compare against is the same as no comparison: showing every
  // score as passing would be a claim, and showing them all as failing worse.
  if (passingScore == null) return 'unknown'
  return averageScore >= passingScore ? 'at-or-above' : 'below'
}
