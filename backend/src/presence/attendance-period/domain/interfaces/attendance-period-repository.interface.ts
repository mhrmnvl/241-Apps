import { AttendancePeriodEntity } from '../entities/attendance-period.entity.js';

export interface AttendancePeriodQueryInput {
  year?: number;
  status?: 'OPEN' | 'CLOSED';
}

export interface ClosePeriodRepositoryInput {
  year: number;
  month: number;
  closedBy: string;
  closedAt: Date;
}

/**
 * Whether a month is closed is asked by three different stories — corrections
 * refuse to edit inside one, work-pattern closes one, payroll refuses to run
 * against an open one — which is why this module is foundational rather than
 * owned by any single story's phase.
 */
export abstract class IAttendancePeriodRepository {
  abstract findAll(
    query: AttendancePeriodQueryInput,
  ): Promise<AttendancePeriodEntity[]>;
  abstract findByPeriod(
    year: number,
    month: number,
  ): Promise<AttendancePeriodEntity | null>;
  /** True when the month has been closed. An unknown month is open. */
  abstract isClosed(year: number, month: number): Promise<boolean>;
  abstract close(
    input: ClosePeriodRepositoryInput,
  ): Promise<AttendancePeriodEntity>;
}
