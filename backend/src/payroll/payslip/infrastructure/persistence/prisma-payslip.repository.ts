import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import {
  PayslipDetail,
  PayslipSummary,
} from '../../domain/entities/payslip-detail.entity.js';
import {
  IPayslipRepository,
  MyPayslipQueryInput,
} from '../../domain/interfaces/payslip-repository.interface.js';

const EMPLOYEE_SELECT = {
  select: { id: true, identifier: true, profile: { select: { name: true } } },
} satisfies Prisma.UserDefaultArgs;

const DETAIL_INCLUDE = {
  user: EMPLOYEE_SELECT,
  payrollRun: {
    select: { id: true, year: true, month: true, kind: true, status: true },
  },
  lines: { orderBy: { componentType: 'asc' } },
} satisfies Prisma.PayslipInclude;

const SUMMARY_INCLUDE = {
  user: EMPLOYEE_SELECT,
} satisfies Prisma.PayslipInclude;

type DetailRow = Prisma.PayslipGetPayload<{ include: typeof DETAIL_INCLUDE }>;
type SummaryRow = Prisma.PayslipGetPayload<{ include: typeof SUMMARY_INCLUDE }>;

/** Whole rupiah as a string — amounts were rounded before they were stored. */
function rupiah(value: Prisma.Decimal): string {
  return value.toFixed(0);
}

function employee(row: SummaryRow['user']) {
  return {
    userId: row.id,
    displayName: row.profile?.name ?? null,
    identifier: row.identifier,
  };
}

function toDetail(row: DetailRow): PayslipDetail {
  return {
    id: row.id,
    run: row.payrollRun,
    employee: employee(row.user),
    attendance: {
      presentDays: row.presentDays,
      absentDays: row.absentDays,
      lateCount: row.lateCount,
      lateMinutes: row.lateMinutes,
      earlyLeaveCount: row.earlyLeaveCount,
      leaveDays: row.leaveDays,
      officialDutyDays: row.officialDutyDays,
    },
    lines: row.lines.map((line) => ({
      componentCode: line.componentCode,
      componentName: line.componentName,
      componentType: line.componentType,
      amount: rupiah(line.amount),
      driver: line.driver,
      driverCount: line.driverCount,
      rate: line.rate === null ? null : rupiah(line.rate),
    })),
    gross: rupiah(row.grossAmount),
    deductions: rupiah(row.deductionAmount),
    net: rupiah(row.netAmount),
  };
}

@Injectable()
export class PrismaPayslipRepository implements IPayslipRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findByRun(runId: string): Promise<PayslipSummary[]> {
    const rows = await this.prisma.payslip.findMany({
      where: { payrollRunId: runId, deletedAt: null },
      include: SUMMARY_INCLUDE,
      orderBy: { user: { profile: { name: 'asc' } } },
    });

    return rows.map((row) => ({
      id: row.id,
      employee: employee(row.user),
      gross: rupiah(row.grossAmount),
      deductions: rupiah(row.deductionAmount),
      net: rupiah(row.netAmount),
    }));
  }

  async findById(id: string): Promise<PayslipDetail | null> {
    const row = await this.prisma.payslip.findFirst({
      where: { id, deletedAt: null },
      include: DETAIL_INCLUDE,
    });

    return row ? toDetail(row) : null;
  }

  async findOwn(
    userId: string,
    query: MyPayslipQueryInput,
  ): Promise<PayslipDetail | null> {
    const row = await this.prisma.payslip.findFirst({
      where: {
        userId,
        deletedAt: null,
        payrollRun: {
          deletedAt: null,
          status: 'APPROVED',
          ...(query.year !== undefined && { year: query.year }),
          ...(query.month !== undefined && { month: query.month }),
        },
      },
      include: DETAIL_INCLUDE,
      orderBy: [
        { payrollRun: { year: 'desc' } },
        { payrollRun: { month: 'desc' } },
        { payrollRun: { sequence: 'desc' } },
      ],
    });

    return row ? toDetail(row) : null;
  }

  async findOwnerId(id: string): Promise<string | null> {
    const row = await this.prisma.payslip.findFirst({
      where: { id, deletedAt: null },
      select: { userId: true },
    });

    return row?.userId ?? null;
  }
}
