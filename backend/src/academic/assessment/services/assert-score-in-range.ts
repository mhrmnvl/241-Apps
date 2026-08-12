import { BadRequestException } from '@nestjs/common';

/**
 * Rejects a mark that falls outside what its assessment is out of.
 *
 * The bound is the item's own `maxScore`, never a fixed ceiling: every subject
 * average is computed as a percentage of that maximum, so a quiz out of 25
 * recorded as 40 does not merely look wrong — it lifts the student's subject
 * score above 100 and, through it, their rank in the class.
 */
export function assertScoreInRange(
  score: number | null | undefined,
  maxScore: number | null | undefined,
): void {
  if (score === null || score === undefined) return;

  const limit = maxScore ?? 100;
  if (score < 0 || score > limit) {
    throw new BadRequestException(
      `Score ${score} is outside the range 0-${limit} allowed by this assessment item`,
    );
  }
}
