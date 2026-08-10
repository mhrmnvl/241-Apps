import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import {
  PayrollRunEntity,
  PayrollRunKindEnum,
  PayrollRunWithTotals,
} from '../../domain/entities/payroll-run.entity.js';
import { ComposedPayslip } from '../../domain/entities/payslip.entity.js';
import {
  CreatePayrollRunInput,
  IPayrollRunRepository,
  PayrollRunQueryInput,
  PayslipNetSnapshot,
  RunStatusTransitionInput,
} from '../../domain/interfaces/payroll-run-repository.interface.js';
import {
  buildRunWhere,
  RUN_INCLUDE,
  rupiah,
  toRunWithTotals,
} from './payroll-run.where.js';
import { clearPayslips, writePayslips } from './payroll-run.writer.js';

@Injectable()
export class PrismaPayrollRunRepository implements IPayrollRunRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: PayrollRunQueryInput): Promise<PayrollRunWithTotals[]> {
    const rows = await this.prisma.payrollRun.findMany({
      where: buildRunWhere(query),
      include: RUN_INCLUDE,
      orderBy: [{ year: 'desc' }, { month: 'desc' }, { sequence: 'desc' }],
    });

    return rows.map(toRunWithTotals);
  }

  async findById(id: string): Promise<PayrollRunWithTotals | null> {
    const row = await this.prisma.payrollRun.findFirst({
      where: { id, deletedAt: null },
      include: RUN_INCLUDE,
    });

    return row ? toRunWithTotals(row) : null;
  }

  async findRunById(id: string): Promise<PayrollRunEntity | null> {
    return this.prisma.payrollRun.findFirst({ where: { id, deletedAt: null } });
  }

  async findByPeriod(
    year: number,
    month: number,
    kind: PayrollRunKindEnum,
  ): Promise<PayrollRunEntity | null> {
    return this.prisma.payrollRun.findFirst({
      where: { year, month, kind, deletedAt: null },
      orderBy: { sequence: 'desc' },
    });
  }

  async nextSequence(
    year: number,
    month: number,
    kind: PayrollRunKindEnum,
  ): Promise<number> {
    const latest = await this.prisma.payrollRun.findFirst({
      where: { year, month, kind },
      orderBy: { sequence: 'desc' },
      select: { sequence: true },
    });

    // Deliberately counts soft-deleted runs too: the unique key does not
    // exclude them, so reusing a sequence would collide.
    return (latest?.sequence ?? 0) + 1;
  }

  async create(input: CreatePayrollRunInput): Promise<PayrollRunWithTotals> {
    const row = await this.prisma.$transaction(async (tx) => {
      const run = await tx.payrollRun.create({
        data: {
          year: input.year,
          month: input.month,
          kind: input.kind,
          sequence: input.sequence,
          note: input.note ?? null,
          createdBy: input.createdBy,
        },
        select: { id: true },
      });

      await writePayslips(tx, run.id, input.payslips);

      return tx.payrollRun.findUniqueOrThrow({
        where: { id: run.id },
        include: RUN_INCLUDE,
      });
    });

    return toRunWithTotals(row);
  }

  async snapshotNets(runId: string): Promise<PayslipNetSnapshot[]> {
    const rows = await this.prisma.payslip.findMany({
      where: { payrollRunId: runId, deletedAt: null },
      select: {
        userId: true,
        netAmount: true,
        user: { select: { profile: { select: { name: true } } } },
      },
    });

    return rows.map((row) => ({
      userId: row.userId,
      displayName: row.user.profile?.name ?? null,
      net: rupiah(row.netAmount),
    }));
  }

  async replacePayslips(
    runId: string,
    payslips: ComposedPayslip[],
  ): Promise<PayrollRunWithTotals> {
    const row = await this.prisma.$transaction(async (tx) => {
      await clearPayslips(tx, runId);
      await writePayslips(tx, runId, payslips);

      return tx.payrollRun.findUniqueOrThrow({
        where: { id: runId },
        include: RUN_INCLUDE,
      });
    });

    return toRunWithTotals(row);
  }

  async transition(
    id: string,
    input: RunStatusTransitionInput,
  ): Promise<PayrollRunWithTotals> {
    const stamp =
      input.status === 'APPROVED'
        ? { approvedBy: input.actorId, approvedAt: input.at }
        : { submittedBy: input.actorId, submittedAt: input.at };

    const row = await this.prisma.payrollRun.update({
      where: { id },
      data: { status: input.status, ...stamp },
      include: RUN_INCLUDE,
    });

    return toRunWithTotals(row);
  }
}
