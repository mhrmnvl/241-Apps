import {
  InventoryLoan,
  InventoryHistory,
  InventoryStatus,
  InventoryTransactionType,
  Prisma,
} from '@prisma/client';
import { LoanQueryDto } from '../../dto/loan-query.dto.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

/**
 * A loan with its items and each item's asset (plus the asset's master-data
 * relations) eagerly loaded — the shape the return/detail use-cases rely on.
 */
export type LoanWithRelations = Prisma.InventoryLoanGetPayload<{
  include: {
    items: {
      include: {
        asset: {
          include: {
            category: true;
            location: true;
            status: true;
            condition: true;
          };
        };
      };
    };
  };
}>;

export abstract class ICirculationRepository {
  abstract findAllLoans(
    query: LoanQueryDto,
  ): Promise<PaginatedResult<InventoryLoan>>;
  abstract findLoanById(id: string): Promise<LoanWithRelations | null>;
  abstract createLoan(
    data: Prisma.InventoryLoanCreateInput,
  ): Promise<InventoryLoan>;
  abstract updateLoan(
    id: string,
    data: Prisma.InventoryLoanUpdateInput,
  ): Promise<InventoryLoan>;
  abstract findLatestLoan(): Promise<InventoryLoan | null>;

  abstract findAllHistories(query: {
    page?: number;
    limit?: number;
    assetId?: string;
  }): Promise<PaginatedResult<InventoryHistory>>;
  abstract createHistory(
    data: Prisma.InventoryHistoryCreateInput,
  ): Promise<InventoryHistory>;

  abstract findStatusByCode(code: string): Promise<InventoryStatus | null>;
  abstract findTransactionTypeByCode(
    code: string,
  ): Promise<InventoryTransactionType | null>;
}
