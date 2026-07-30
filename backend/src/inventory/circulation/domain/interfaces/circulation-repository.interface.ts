import {
  InventoryLoan,
  InventoryHistory,
  InventoryStatus,
  InventoryStatusKey,
  InventoryTransactionType,
  Prisma,
} from '@prisma/client';
import { LoanQueryDto } from '../../dto/request/loan-query.dto.js';
import { PaginatedResult } from '../../../../shared/domain/interfaces/repository.interface.js';

/**
 * A loan with its items and each item's asset (plus the asset's master-data
 * relations) eagerly loaded — the shape the return/detail use-cases rely on.
 */
export type LoanWithRelations = Prisma.InventoryLoanGetPayload<{
  include: {
    items: {
      include: {
        unit: {
          include: {
            asset: true;
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
    unitId?: string;
  }): Promise<PaginatedResult<InventoryHistory>>;
  abstract createHistory(
    data: Prisma.InventoryHistoryCreateInput,
  ): Promise<InventoryHistory>;

  abstract findStatusByCode(code: string): Promise<InventoryStatus | null>;
  /** Looks up a status by its protected role in the loan lifecycle, never by
   * the admin-editable code/name (see InventoryStatusKey in inventory.prisma). */
  abstract findStatusBySystemKey(
    key: InventoryStatusKey,
  ): Promise<InventoryStatus | null>;
  abstract findTransactionTypeByCode(
    code: string,
  ): Promise<InventoryTransactionType | null>;

  abstract findUnitsByIds(ids: string[]): Promise<
    {
      id: string;
      unitNumber: string;
      statusId: string;
      asset: { name: string };
      status: { allowTransactions: boolean } | null;
    }[]
  >;

  abstract processCreateLoanTransaction(params: {
    loanNumber: string;
    requesterId: string;
    expectedReturnDate: Date;
    purpose: string;
    pendingStatusId: string;
    unitIds: string[];
    units: { id: string; statusId: string }[];
  }): Promise<unknown>;

  abstract processReturnLoanTransaction(params: {
    loanId: string;
    returnedStatusId: string;
    availStatusId: string;
    txTypeId: string;
    changedById: string;
    loanNumber: string;
    items: { unitId: string; conditionId: string; note?: string }[];
  }): Promise<unknown>;
}
