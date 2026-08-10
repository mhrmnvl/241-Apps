import {
  NonWorkingDayEntity,
  WorkPatternAssignmentWithDetails,
  WorkPatternDayEntity,
  WorkPatternEntity,
  WorkPatternWithDays,
} from '../entities/work-pattern.entity.js';

export type {
  NonWorkingDayEntity,
  WorkPatternAssignmentWithDetails,
  WorkPatternWithDays,
};

export interface CreateWorkPatternInput {
  name: string;
  graceMinutes: number;
  isDefault?: boolean;
}

export type UpdateWorkPatternInput = Partial<CreateWorkPatternInput>;

export type WorkPatternDayInput = Omit<
  WorkPatternDayEntity,
  'id' | 'workPatternId'
>;

export interface AssignWorkPatternInput {
  userId: string;
  workPatternId: string;
  effectiveFrom: Date;
}

export interface NonWorkingDayInput {
  date: Date;
  name: string;
  sourceCalendarId?: string | null;
}

export interface NonWorkingDayQueryInput {
  from?: Date;
  to?: Date;
}

export interface ResolvedPattern {
  workPatternId: string | null;
  patternName: string | null;
  isWorkingDay: boolean;
  /** "HH:mm" wall-clock times, null on a non-working weekday. */
  startTime: string | null;
  endTime: string | null;
  graceMinutes: number;
}

/**
 * Owns `work_patterns`, `work_pattern_days`, `work_pattern_assignments`, and
 * `non_working_days`.
 *
 * `daily-record` asks through this port rather than joining the tables itself:
 * a repository queries only the models its own module owns (Principle VI), and
 * the single-Prisma-client convenience is exactly what quietly turns a modular
 * monolith back into a big ball of mud.
 *
 * User Story 1 uses only these two reads against the seeded default pattern;
 * User Story 4 adds the management use cases on top of the same module.
 */
export abstract class IWorkPatternRepository {
  /**
   * The pattern in force for a person on a date — their assignment if one
   * covers it, otherwise the school-wide default.
   */
  abstract resolveForUserAndDate(
    userId: string,
    date: Date,
  ): Promise<ResolvedPattern>;

  /** A national or school holiday. Nobody is absent on one (FR-026). */
  abstract isNonWorkingDay(date: Date): Promise<boolean>;

  // --- Pattern management (User Story 4) ---

  abstract findAll(): Promise<WorkPatternWithDays[]>;
  abstract findById(id: string): Promise<WorkPatternWithDays | null>;
  abstract create(input: CreateWorkPatternInput): Promise<WorkPatternEntity>;
  abstract update(
    id: string,
    input: UpdateWorkPatternInput,
  ): Promise<WorkPatternEntity>;
  abstract softDelete(id: string): Promise<WorkPatternEntity>;
  /** Replaces all seven weekdays atomically — a partial write could drop Friday. */
  abstract replaceDays(
    workPatternId: string,
    days: WorkPatternDayInput[],
  ): Promise<WorkPatternDayEntity[]>;
  abstract countAssignments(workPatternId: string): Promise<number>;

  // --- Assignments ---

  abstract findAssignments(
    userId?: string,
  ): Promise<WorkPatternAssignmentWithDetails[]>;
  /** Closes any assignment overlapping `effectiveFrom`, then inserts. */
  abstract assign(
    input: AssignWorkPatternInput,
  ): Promise<WorkPatternAssignmentWithDetails>;
  abstract removeAssignment(id: string): Promise<void>;

  // --- Non-working days ---

  abstract findNonWorkingDays(
    query: NonWorkingDayQueryInput,
  ): Promise<NonWorkingDayEntity[]>;
  abstract bulkUpsertNonWorkingDays(
    days: NonWorkingDayInput[],
  ): Promise<{ imported: number; skipped: number }>;
  abstract updateNonWorkingDay(
    id: string,
    name: string,
  ): Promise<NonWorkingDayEntity>;
  abstract deleteNonWorkingDay(id: string): Promise<void>;
}
