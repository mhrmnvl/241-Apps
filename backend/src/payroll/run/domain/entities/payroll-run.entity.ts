import { PayrollRunKind, PayrollRunStatus } from '@prisma/client';

export type PayrollRunStatusEnum = `${PayrollRunStatus}`;
export type PayrollRunKindEnum = `${PayrollRunKind}`;

export interface PayrollActorRef {
  id: string;
  displayName: string | null;
}

export interface PayrollRunEntity {
  id: string;
  year: number;
  month: number;
  kind: PayrollRunKindEnum;
  sequence: number;
  status: PayrollRunStatusEnum;
  roundingRule: string;
  createdBy: string;
  note: string | null;
  submittedAt: Date | null;
  approvedAt: Date | null;
  createdAt: Date;
}

/** Whole-rupiah strings — money never crosses a boundary as a JSON number. */
export interface PayrollRunTotals {
  employeeCount: number;
  gross: string;
  deductions: string;
  net: string;
}

/** One person's net before and after a recalculation (FR-044). */
export interface PayslipNetChange {
  userId: string;
  displayName: string | null;
  previousNet: string;
  currentNet: string;
}

export interface PreviousDraftComparison {
  net: string;
  changedPayslips: PayslipNetChange[];
}

export interface PayrollRunWithTotals extends Omit<
  PayrollRunEntity,
  'createdBy'
> {
  totals: PayrollRunTotals;
  createdBy: PayrollActorRef;
  submittedBy: PayrollActorRef | null;
  approvedBy: PayrollActorRef | null;
}
