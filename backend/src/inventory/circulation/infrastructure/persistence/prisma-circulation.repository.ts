import { Injectable } from '@nestjs/common';
import {
  InventoryLoan,
  InventoryHistory,
  InventoryStatus,
  InventoryStatusKey,
  InventoryTransactionType,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../../../../core/database/prisma.service.js';
import {
  CreateInventoryHistoryInput,
  CreateLoanRepositoryInput,
  ICirculationRepository,
  InventoryHistoryQueryInput,
  LoanQueryInput,
  LoanWithRelations,
  ProcessCreateLoanInput,
  ProcessReturnLoanInput,
  UpdateLoanRepositoryInput,
} from '../../domain/interfaces/circulation-repository.interface.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

@Injectable()
export class PrismaCirculationRepository extends ICirculationRepository {
  constructor(private readonly prisma: PrismaService) {
    super();
  }

  async findAllLoans(
    query: LoanQueryInput,
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
              unit: {
                include: {
                  asset: true,
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
            unit: {
              include: {
                asset: true,
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

  async createLoan(data: CreateLoanRepositoryInput): Promise<InventoryLoan> {
    return this.prisma.inventoryLoan.create({ data });
  }

  async updateLoan(
    id: string,
    data: UpdateLoanRepositoryInput,
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

  async findAllHistories(
    query: InventoryHistoryQueryInput,
  ): Promise<PaginatedResult<InventoryHistory>> {
    const { page = 1, limit = 10, unitId } = query;
    const skip = (page - 1) * limit;

    const where: Prisma.InventoryHistoryWhereInput = {};
    if (unitId) {
      where.unitId = unitId;
    }

    const [data, total] = await Promise.all([
      this.prisma.inventoryHistory.findMany({
        where,
        skip,
        take: limit,
        orderBy: { changedAt: 'desc' },
        include: {
          unit: { include: { asset: true } },
          transactionType: true,
        },
      }),
      this.prisma.inventoryHistory.count({ where }),
    ]);

    return { data, total, page, limit };
  }

  async createHistory(
    data: CreateInventoryHistoryInput,
  ): Promise<InventoryHistory> {
    return this.prisma.inventoryHistory.create({ data });
  }

  async findStatusByCode(code: string): Promise<InventoryStatus | null> {
    return this.prisma.inventoryStatus.findUnique({
      where: { code },
    });
  }

  async findStatusBySystemKey(
    systemKey: InventoryStatusKey,
  ): Promise<InventoryStatus | null> {
    return this.prisma.inventoryStatus.findUnique({
      where: { systemKey },
    });
  }

  async findTransactionTypeByCode(
    code: string,
  ): Promise<InventoryTransactionType | null> {
    return this.prisma.inventoryTransactionType.findUnique({
      where: { code },
    });
  }

  async findUnitsByIds(ids: string[]): Promise<
    {
      id: string;
      unitNumber: string;
      statusId: string;
      asset: { name: string };
      status: { allowTransactions: boolean } | null;
    }[]
  > {
    return this.prisma.inventoryAssetUnit.findMany({
      where: {
        id: { in: ids },
        deletedAt: null,
      },
      include: { asset: true, status: true },
    });
  }

  async processCreateLoanTransaction(
    params: ProcessCreateLoanInput,
  ): Promise<LoanWithRelations> {
    return this.prisma.$transaction(async (tx) => {
      const loan = await tx.inventoryLoan.create({
        data: {
          loanNumber: params.loanNumber,
          requesterId: params.requesterId,
          expectedReturnDate: params.expectedReturnDate,
          purpose: params.purpose,
          statusId: params.pendingStatusId,
          items: {
            create: params.unitIds.map((unitId) => ({
              unitId,
            })),
          },
        },
      });

      await tx.inventoryAssetUnit.updateMany({
        where: { id: { in: params.unitIds } },
        data: { statusId: params.pendingStatusId },
      });

      const activeWorkflow = await tx.approvalWorkflow.findFirst({
        where: { targetEntity: 'InventoryLoan', isActive: true },
      });

      if (activeWorkflow) {
        const instance = await tx.approvalInstance.create({
          data: {
            workflowId: activeWorkflow.id,
            referenceId: loan.id,
            currentStepSequence: 1,
            statusId: params.pendingStatusId,
          },
        });

        return tx.inventoryLoan.update({
          where: { id: loan.id },
          data: { workflowInstanceId: instance.id },
          include: {
            items: {
              include: {
                unit: true,
              },
            },
          },
        });
      } else {
        const approvedStatus = await tx.inventoryStatus.findUnique({
          where: { systemKey: 'LOAN_APPROVED' },
        });
        const loanedStatus = await tx.inventoryStatus.findUnique({
          where: { systemKey: 'LOANED' },
        });
        const txType = await tx.inventoryTransactionType.findUnique({
          where: { code: 'TX-LOAN-OUT' },
        });

        if (!approvedStatus || !loanedStatus || !txType) {
          throw new Error(
            'The LOAN_APPROVED/ON_LOAN status roles are not configured, or the TX-LOAN-OUT transaction type is missing',
          );
        }

        const approvedLoan = await tx.inventoryLoan.update({
          where: { id: loan.id },
          data: { statusId: approvedStatus.id },
        });

        await tx.inventoryAssetUnit.updateMany({
          where: { id: { in: params.unitIds } },
          data: { statusId: loanedStatus.id },
        });

        for (const unit of params.units) {
          await tx.inventoryHistory.create({
            data: {
              unitId: unit.id,
              transactionTypeId: txType.id,
              previousStatusId: unit.statusId,
              newStatusId: loanedStatus.id,
              note: `Peminjaman otomatis disetujui (No. ${params.loanNumber})`,
              changedById: params.requesterId,
            },
          });
        }

        return approvedLoan;
      }
    });
  }

  async processReturnLoanTransaction(
    params: ProcessReturnLoanInput,
  ): Promise<LoanWithRelations> {
    return this.prisma.$transaction(async (tx) => {
      const updatedLoan = await tx.inventoryLoan.update({
        where: { id: params.loanId },
        data: {
          actualReturnDate: new Date(),
          statusId: params.returnedStatusId,
        },
      });

      for (const itemDto of params.items) {
        await tx.inventoryAssetUnit.update({
          where: { id: itemDto.unitId },
          data: {
            statusId: params.availStatusId,
            conditionId: itemDto.conditionId,
          },
        });

        await tx.inventoryHistory.create({
          data: {
            unitId: itemDto.unitId,
            transactionTypeId: params.txTypeId,
            newStatusId: params.availStatusId,
            note:
              itemDto.note ??
              `Pengembalian pinjaman (No. ${params.loanNumber})`,
            changedById: params.changedById,
          },
        });
      }

      return updatedLoan;
    });
  }
}
