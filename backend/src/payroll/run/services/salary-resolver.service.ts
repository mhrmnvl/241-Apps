import { Injectable } from '@nestjs/common';
import {
  EffectiveAssignment,
  ISalaryAssignmentRepository,
} from '../../assignment/domain/interfaces/salary-assignment-repository.interface.js';

export interface ResolvedSalary {
  userId: string;
  assignments: EffectiveAssignment[];
}

/** The last day of a month, in the wall-clock frame the school works in. */
export function periodEnd(year: number, month: number): Date {
  return new Date(Date.UTC(year, month, 0));
}

@Injectable()
export class SalaryResolverService {
  constructor(private readonly assignments: ISalaryAssignmentRepository) {}

  /**
   * Which salary assignments were in force for each person in this month.
   *
   * Resolved against the **last day of the period**, not today. A salary
   * changed effective the 15th therefore applies to the whole month, and the
   * payslip states which amount it used (spec edge case). Proration is out of
   * scope — stating the applied amount plainly beats silently blending two.
   */
  async resolve(
    userIds: string[],
    year: number,
    month: number,
  ): Promise<Map<string, EffectiveAssignment[]>> {
    const effective = await this.assignments.findEffectiveOn(
      userIds,
      periodEnd(year, month),
    );

    const byUser = new Map<string, EffectiveAssignment[]>(
      userIds.map((userId) => [userId, []]),
    );

    for (const assignment of effective) {
      byUser.get(assignment.userId)?.push(assignment);
    }

    return byUser;
  }

  /**
   * Who has nothing to be paid by.
   *
   * The run refuses rather than paying them zero: a silent zero is
   * indistinguishable from a correct figure on a payslip, and the person only
   * finds out on payday (FR-054 / the create-run precondition).
   */
  unconfigured(byUser: Map<string, EffectiveAssignment[]>): string[] {
    return [...byUser.entries()]
      .filter(([, assignments]) => assignments.length === 0)
      .map(([userId]) => userId);
  }
}
