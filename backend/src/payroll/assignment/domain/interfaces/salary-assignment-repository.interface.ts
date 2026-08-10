import {
  EffectiveAssignment,
  SalaryAssignmentEntity,
  SalaryAssignmentWithComponent,
} from '../entities/salary-assignment.entity.js';

export type { EffectiveAssignment, SalaryAssignmentWithComponent };

export interface CreateSalaryAssignmentInput {
  userId: string;
  componentId: string;
  amount?: string | null;
  rate?: string | null;
  effectiveFrom: Date;
  createdBy: string;
}

export abstract class ISalaryAssignmentRepository {
  abstract findAll(userId?: string): Promise<SalaryAssignmentWithComponent[]>;
  abstract findById(id: string): Promise<SalaryAssignmentEntity | null>;

  /**
   * The assignments in force on a date, for the given people.
   *
   * A superseded row is never updated in place — it is closed with an
   * `effectiveTo` — so a run for an earlier month reproduces the figures that
   * were actually in force then (FR-042).
   */
  abstract findEffectiveOn(
    userIds: string[],
    date: Date,
  ): Promise<EffectiveAssignment[]>;

  /** Closes any open assignment for the same pair, then inserts. */
  abstract create(
    input: CreateSalaryAssignmentInput,
  ): Promise<SalaryAssignmentWithComponent>;
  abstract softDelete(id: string): Promise<SalaryAssignmentEntity>;
}
