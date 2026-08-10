import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import {
  EffectiveAssignment,
  SalaryAssignmentEntity,
  SalaryAssignmentWithComponent,
} from '../../domain/entities/salary-assignment.entity.js';
import {
  CreateSalaryAssignmentInput,
  ISalaryAssignmentRepository,
} from '../../domain/interfaces/salary-assignment-repository.interface.js';

const ASSIGNMENT_INCLUDE = {
  component: {
    select: { id: true, code: true, name: true, type: true, driver: true },
  },
  user: { select: { id: true, profile: { select: { name: true } } } },
} satisfies Prisma.SalaryAssignmentInclude;

type Row = Prisma.SalaryAssignmentGetPayload<{
  include: typeof ASSIGNMENT_INCLUDE;
}>;

/**
 * Decimal → whole-rupiah string. Money never crosses a boundary as a JSON
 * number: IEEE-754 doubles are the last thing a salary should pass through.
 */
function money(value: Prisma.Decimal | null): string | null {
  return value === null ? null : value.toFixed(2);
}

function toDetails(row: Row): SalaryAssignmentWithComponent {
  const { component, user, amount, rate, ...assignment } = row;

  return {
    ...assignment,
    amount: money(amount),
    rate: money(rate),
    component,
    holder: { id: user.id, displayName: user.profile?.name ?? null },
  };
}

@Injectable()
export class PrismaSalaryAssignmentRepository implements ISalaryAssignmentRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId?: string): Promise<SalaryAssignmentWithComponent[]> {
    const rows = await this.prisma.salaryAssignment.findMany({
      where: { deletedAt: null, ...(userId && { userId }) },
      include: ASSIGNMENT_INCLUDE,
      orderBy: [{ userId: 'asc' }, { effectiveFrom: 'desc' }],
    });

    return rows.map(toDetails);
  }

  async findById(id: string): Promise<SalaryAssignmentEntity | null> {
    const row = await this.prisma.salaryAssignment.findFirst({
      where: { id, deletedAt: null },
      include: ASSIGNMENT_INCLUDE,
    });

    return row ? toDetails(row) : null;
  }

  async findEffectiveOn(
    userIds: string[],
    date: Date,
  ): Promise<EffectiveAssignment[]> {
    if (userIds.length === 0) return [];

    const rows = await this.prisma.salaryAssignment.findMany({
      where: {
        userId: { in: userIds },
        deletedAt: null,
        effectiveFrom: { lte: date },
        OR: [{ effectiveTo: null }, { effectiveTo: { gte: date } }],
        component: { deletedAt: null },
      },
      include: ASSIGNMENT_INCLUDE,
      orderBy: { effectiveFrom: 'desc' },
    });

    // One assignment per (person, component): the newest whose window covers
    // the date. Closing supersedes on write makes overlaps impossible, but
    // taking the newest keeps a legacy overlap deterministic rather than
    // arbitrary.
    const seen = new Set<string>();
    const effective: EffectiveAssignment[] = [];

    for (const row of rows) {
      const key = `${row.userId}:${row.componentId}`;
      if (seen.has(key)) continue;
      seen.add(key);

      effective.push({
        userId: row.userId,
        componentId: row.componentId,
        componentCode: row.component.code,
        componentName: row.component.name,
        componentType: row.component.type,
        driver: row.component.driver,
        amount: money(row.amount),
        rate: money(row.rate),
        effectiveFrom: row.effectiveFrom,
      });
    }

    return effective;
  }

  /**
   * Supersede, never overwrite.
   *
   * The previous row is closed the day before the new one starts, in the same
   * transaction. That is what lets a rerun of an earlier month reproduce its
   * original figures — an in-place update would rewrite history and change a
   * payslip that has already been approved.
   */
  async create(
    input: CreateSalaryAssignmentInput,
  ): Promise<SalaryAssignmentWithComponent> {
    const { userId, componentId, effectiveFrom } = input;
    const dayBefore = new Date(effectiveFrom);
    dayBefore.setUTCDate(dayBefore.getUTCDate() - 1);

    const row = await this.prisma.$transaction(async (tx) => {
      await tx.salaryAssignment.updateMany({
        where: {
          userId,
          componentId,
          deletedAt: null,
          effectiveTo: null,
          effectiveFrom: { lt: effectiveFrom },
        },
        data: { effectiveTo: dayBefore },
      });

      return tx.salaryAssignment.create({
        data: {
          userId,
          componentId,
          amount: input.amount ?? null,
          rate: input.rate ?? null,
          effectiveFrom,
          createdBy: input.createdBy,
        },
        include: ASSIGNMENT_INCLUDE,
      });
    });

    return toDetails(row);
  }

  async softDelete(id: string): Promise<SalaryAssignmentEntity> {
    const row = await this.prisma.salaryAssignment.update({
      where: { id },
      data: { deletedAt: new Date() },
      include: ASSIGNMENT_INCLUDE,
    });

    return toDetails(row);
  }
}
