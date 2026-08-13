/**
 * What happens to a student at the end of an academic year.
 *
 * Graduation is deliberately absent. It used to be a third action here, which
 * meant one screen both moved students up a grade and ended their time at the
 * school — two decisions with different permissions, different records and
 * different people making them. It is now its own action, under Kelulusan.
 */
export enum PromotionAction {
  PROMOTE = 'PROMOTE',
  REPEAT = 'REPEAT',
}
