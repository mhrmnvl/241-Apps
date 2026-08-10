import { Prisma } from '@prisma/client';
import {
  PayrollActorRef,
  PayrollRunWithTotals,
} from '../../domain/entities/payroll-run.entity.js';
import { PayrollRunQueryInput } from '../../domain/interfaces/payroll-run-repository.interface.js';

export function buildRunWhere(
  query: PayrollRunQueryInput,
): Prisma.PayrollRunWhereInput {
  return {
    deletedAt: null,
    ...(query.year !== undefined && { year: query.year }),
    ...(query.status && { status: query.status }),
  };
}

const ACTOR_SELECT = {
  select: { id: true, profile: { select: { name: true } } },
} satisfies Prisma.UserDefaultArgs;

/**
 * Totals are summed from the payslips rather than stored on the run.
 *
 * A stored total is a second copy of a number the lines already determine, and
 * the two drift the moment a recalculation touches one and not the other. The
 * volume makes this cheap — twelve runs a year, tens of payslips each.
 */
export const RUN_INCLUDE = {
  creator: ACTOR_SELECT,
  submitter: ACTOR_SELECT,
  approver: ACTOR_SELECT,
  payslips: {
    where: { deletedAt: null },
    select: { grossAmount: true, deductionAmount: true, netAmount: true },
  },
} satisfies Prisma.PayrollRunInclude;

type RunRow = Prisma.PayrollRunGetPayload<{ include: typeof RUN_INCLUDE }>;

/** Whole rupiah as a string: the API never emits money as a JSON number. */
export function rupiah(value: Prisma.Decimal | number): string {
  return typeof value === 'number'
    ? String(Math.round(value))
    : value.toFixed(0);
}

function actor(
  row: { id: string; profile: { name: string } | null } | null,
): PayrollActorRef | null {
  return row ? { id: row.id, displayName: row.profile?.name ?? null } : null;
}

export function toRunWithTotals(row: RunRow): PayrollRunWithTotals {
  let gross = 0;
  let deductions = 0;
  let net = 0;

  for (const payslip of row.payslips) {
    gross += payslip.grossAmount.toNumber();
    deductions += payslip.deductionAmount.toNumber();
    net += payslip.netAmount.toNumber();
  }

  return {
    id: row.id,
    year: row.year,
    month: row.month,
    kind: row.kind,
    sequence: row.sequence,
    status: row.status,
    roundingRule: row.roundingRule,
    note: row.note,
    submittedAt: row.submittedAt,
    approvedAt: row.approvedAt,
    createdAt: row.createdAt,
    totals: {
      employeeCount: row.payslips.length,
      gross: rupiah(gross),
      deductions: rupiah(deductions),
      net: rupiah(net),
    },
    createdBy: actor(row.creator) ?? { id: row.createdBy, displayName: null },
    submittedBy: actor(row.submitter),
    approvedBy: actor(row.approver),
  };
}
