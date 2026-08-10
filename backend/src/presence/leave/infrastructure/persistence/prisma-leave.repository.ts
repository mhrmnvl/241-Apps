import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { PresenceSubjectTypeEnum } from '../../../credential/domain/entities/credential.entity.js';
import {
  LeaveBalanceRow,
  LeaveRequestWithDetails,
  LeaveTypeEntity,
} from '../../domain/entities/leave.entity.js';
import {
  CreateLeaveTypeInput,
  DecideLeaveInput,
  ILeaveRepository,
  LeaveRequestQueryInput,
  SubmitLeaveInput,
  UpdateLeaveTypeInput,
} from '../../domain/interfaces/leave-repository.interface.js';

import * as balances from './prisma-leave.balances.js';
import { REQUEST_INCLUDE, toDetails } from './prisma-leave.includes.js';
import * as types from './prisma-leave.types.js';

@Injectable()
export class PrismaLeaveRepository implements ILeaveRepository {
  constructor(private readonly prisma: PrismaService) {}

  // --- Leave types (implemented in `.types.ts`) ---

  async findTypes(includeInactive = false): Promise<LeaveTypeEntity[]> {
    return types.findTypes(this.prisma, includeInactive);
  }

  async findTypeById(id: string): Promise<LeaveTypeEntity | null> {
    return types.findTypeById(this.prisma, id);
  }

  async createType(input: CreateLeaveTypeInput): Promise<LeaveTypeEntity> {
    return types.createType(this.prisma, input);
  }

  async updateType(
    id: string,
    input: UpdateLeaveTypeInput,
  ): Promise<LeaveTypeEntity> {
    return types.updateType(this.prisma, id, input);
  }

  async softDeleteType(id: string): Promise<LeaveTypeEntity> {
    return types.softDeleteType(this.prisma, id);
  }

  async countRequestsOfType(leaveTypeId: string): Promise<number> {
    return types.countRequestsOfType(this.prisma, leaveTypeId);
  }

  // --- Requests ---

  async findRequests(
    query: LeaveRequestQueryInput,
  ): Promise<LeaveRequestWithDetails[]> {
    const rows = await this.prisma.leaveRequest.findMany({
      where: {
        deletedAt: null,
        ...(query.requesterId && { requesterId: query.requesterId }),
        ...(query.status && { status: query.status }),
        ...(query.year && {
          startDate: {
            gte: new Date(Date.UTC(query.year, 0, 1)),
            lte: new Date(Date.UTC(query.year, 11, 31, 23, 59, 59, 999)),
          },
        }),
      },
      include: REQUEST_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });

    return rows.map(toDetails);
  }

  async findRequestById(id: string): Promise<LeaveRequestWithDetails | null> {
    const row = await this.prisma.leaveRequest.findFirst({
      where: { id, deletedAt: null },
      include: REQUEST_INCLUDE,
    });

    return row ? toDetails(row) : null;
  }

  async submit(input: SubmitLeaveInput): Promise<LeaveRequestWithDetails> {
    const { days, ...request } = input;

    const row = await this.prisma.leaveRequest.create({
      data: {
        ...request,
        days: { create: days.map((date) => ({ date })) },
      },
      include: REQUEST_INCLUDE,
    });

    return toDetails(row);
  }

  /**
   * One transaction: a request marked approved whose covered days never landed
   * in `DailyPresence` would still show the person absent on leave they were
   * granted — and that absence is what payroll would deduct against.
   *
   * The days are upserted rather than created, because a day may already exist
   * from a gate scan (someone who came in anyway) or a manual entry.
   */
  async approve(
    id: string,
    input: DecideLeaveInput,
    treatment: 'ON_LEAVE' | 'OFFICIAL_DUTY',
    subjectType: PresenceSubjectTypeEnum,
  ): Promise<LeaveRequestWithDetails> {
    const row = await this.prisma.$transaction(async (tx) => {
      const approved = await tx.leaveRequest.update({
        where: { id },
        data: { status: 'APPROVED', ...input },
        include: REQUEST_INCLUDE,
      });

      for (const { date } of approved.days) {
        const existing = await tx.dailyPresence.findFirst({
          where: { userId: approved.requesterId, date, deletedAt: null },
          select: { id: true },
        });

        if (existing) {
          await tx.dailyPresence.update({
            where: { id: existing.id },
            data: {
              status: treatment,
              statusSource: 'MANUAL',
              leaveRequestId: id,
            },
          });
        } else {
          await tx.dailyPresence.create({
            data: {
              userId: approved.requesterId,
              subjectType,
              date,
              status: treatment,
              statusSource: 'MANUAL',
              leaveRequestId: id,
            },
          });
        }
      }

      return approved;
    });

    return toDetails(row);
  }

  async reject(
    id: string,
    input: DecideLeaveInput,
  ): Promise<LeaveRequestWithDetails> {
    const row = await this.prisma.leaveRequest.update({
      where: { id },
      data: { status: 'REJECTED', ...input },
      include: REQUEST_INCLUDE,
    });

    return toDetails(row);
  }

  async withdraw(id: string): Promise<LeaveRequestWithDetails> {
    const row = await this.prisma.leaveRequest.update({
      where: { id },
      data: { status: 'WITHDRAWN' },
      include: REQUEST_INCLUDE,
    });

    return toDetails(row);
  }

  // --- Balances (implemented in `.balances.ts`) ---

  async findBalances(userId: string, year: number): Promise<LeaveBalanceRow[]> {
    return balances.findBalances(this.prisma, userId, year);
  }

  async countUsedDays(
    userId: string,
    leaveTypeId: string,
    year: number,
  ): Promise<number> {
    return balances.countUsedDays(this.prisma, userId, leaveTypeId, year);
  }
}
