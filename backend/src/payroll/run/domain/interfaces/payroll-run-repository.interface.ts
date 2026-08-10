import {
  PayrollRunEntity,
  PayrollRunKindEnum,
  PayrollRunStatusEnum,
  PayrollRunWithTotals,
  PayslipNetChange,
} from '../entities/payroll-run.entity.js';
import { ComposedPayslip } from '../entities/payslip.entity.js';

export interface PayrollRunQueryInput {
  year?: number;
  status?: PayrollRunStatusEnum;
}

export interface CreatePayrollRunInput {
  year: number;
  month: number;
  kind: PayrollRunKindEnum;
  sequence: number;
  note?: string | null;
  createdBy: string;
  payslips: ComposedPayslip[];
}

export interface RunStatusTransitionInput {
  status: PayrollRunStatusEnum;
  actorId: string;
  at: Date;
}

/** A person's net in the run as it stands, for the recalculation comparison. */
export interface PayslipNetSnapshot {
  userId: string;
  displayName: string | null;
  net: string;
}

export abstract class IPayrollRunRepository {
  abstract findAll(
    query: PayrollRunQueryInput,
  ): Promise<PayrollRunWithTotals[]>;
  abstract findById(id: string): Promise<PayrollRunWithTotals | null>;

  /** The run itself, without totals — enough to check a state transition. */
  abstract findRunById(id: string): Promise<PayrollRunEntity | null>;
  abstract findByPeriod(
    year: number,
    month: number,
    kind: PayrollRunKindEnum,
  ): Promise<PayrollRunEntity | null>;
  abstract nextSequence(
    year: number,
    month: number,
    kind: PayrollRunKindEnum,
  ): Promise<number>;

  /** Run, payslips and lines in one interactive transaction. */
  abstract create(input: CreatePayrollRunInput): Promise<PayrollRunWithTotals>;

  /** The nets currently stored, read before a recalculation replaces them. */
  abstract snapshotNets(runId: string): Promise<PayslipNetSnapshot[]>;

  /** Deletes every payslip of the run and writes the new ones, in one go. */
  abstract replacePayslips(
    runId: string,
    payslips: ComposedPayslip[],
  ): Promise<PayrollRunWithTotals>;

  abstract transition(
    id: string,
    input: RunStatusTransitionInput,
  ): Promise<PayrollRunWithTotals>;
}

export type { PayslipNetChange };
