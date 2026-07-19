import { Injectable } from '@nestjs/common';
import {
  InventoryLoan,
  InventoryHistory,
  InventoryStatus,
  InventoryTransactionType,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import { LoanQueryDto } from '../../dto/loan-query.dto.js';
import {
  ICirculationRepository,
  LoanWithRelations,
} from '../../domain/interfaces/circulation-repository.interface.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

@Injectable()
export class PrismaCirculationRepository extends ICirculationRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAllLoans(
    query: LoanQueryDto,
  ): Promise<PaginatedResult<InventoryLoan>> {
    const { page = 1, limit = 10, keyword, statusId, requesterId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.InventoryLoanWhereInput = {};

    if (statusId && statusId !== 'all') {
      where.statusId = statusId;
    }
    if (requesterId) {
      where.requesterId = requesterId;
    }
    if (keyword && keyword.trim() !== '') {
      where.OR = [
        { loanNumber: { contains: keyword, mode: 'insensitive' } },
        { purpose: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.inventoryLoan.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          items: {
            include: {
              asset: {
                include: {
                  category: true,
                  location: true,
                  status: true,
                  condition: true,
                },
              },
            },
          },
        },
      }),
      this.prisma.inventoryLoan.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async findLoanById(id: string): Promise<LoanWithRelations | null> {
    return this.prisma.inventoryLoan.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            asset: {
              include: {
                category: true,
                location: true,
                status: true,
                condition: true,
              },
            },
          },
        },
      },
    });
  }

  async createLoan(
    data: Prisma.InventoryLoanCreateInput,
  ): Promise<InventoryLoan> {
    return this.prisma.inventoryLoan.create({ data });
  }

  async updateLoan(
    id: string,
    data: Prisma.InventoryLoanUpdateInput,
  ): Promise<InventoryLoan> {
    return this.prisma.inventoryLoan.update({
      where: { id },
      data,
    });
  }

  async findLatestLoan(): Promise<InventoryLoan | null> {
    return this.prisma.inventoryLoan.findFirst({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllHistories(query: {
    page?: number;
    limit?: number;
    assetId?: string;
  }): Promise<PaginatedResult<InventoryHistory>> {
    const { page = 1, limit = 10, assetId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.InventoryHistoryWhereInput = {};
    if (assetId) {
      where.assetId = assetId;
    }

    const [data, total] = await Promise.all([
      this.prisma.inventoryHistory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { changedAt: 'desc' },
        include: {
          asset: true,
          transactionType: true,
        },
      }),
      this.prisma.inventoryHistory.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async createHistory(
    data: Prisma.InventoryHistoryCreateInput,
  ): Promise<InventoryHistory> {
    return this.prisma.inventoryHistory.create({ data });
  }

  async findStatusByCode(code: string): Promise<InventoryStatus | null> {
    return this.prisma.inventoryStatus.findUnique({
      where: { code },
    });
  }

  async findTransactionTypeByCode(
    code: string,
  ): Promise<InventoryTransactionType | null> {
    return this.prisma.inventoryTransactionType.findUnique({
      where: { code },
    });
  }
}
