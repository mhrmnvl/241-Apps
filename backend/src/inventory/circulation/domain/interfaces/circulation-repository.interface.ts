import {
  PaginatedResult,
  PaginationQueryInput,
} from '../../../../shared/domain/interfaces/repository.interface.js';

export interface InventoryStatusRow {
  id: string;
  code: string;
  name: string;
  systemKey?: string | null;
  allowTransactions: boolean;
}

export interface InventoryTransactionTypeRow {
  id: string;
  code: string;
  name: string;
}

export interface LoanItemRow {
  id: string;
  loanId: string;
  unitId: string;
  returnedConditionId?: string | null;
  note?: string | null;
}

export interface LoanWithRelations {
  id: string;
  loanNumber: string;
  requesterId: string;
  expectedReturnDate: Date;
  actualReturnDate?: Date | null;
  purpose: string;
  statusId: string;
  workflowInstanceId?: string | null;
  status?: InventoryStatusRow | null;
  items?: LoanItemRow[];
  requester?: { id: string; identifier: string } | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface InventoryHistoryRow {
  id: string;
  unitId: string;
  transactionTypeId: string;
  previousConditionId?: string | null;
  newConditionId?: string | null;
  previousStatusId?: string | null;
  newStatusId?: string | null;
  previousLocationId?: string | null;
  newLocationId?: string | null;
  previousCustodianId?: string | null;
  newCustodianId?: string | null;
  note?: string | null;
  changedById: string;
  changedAt: Date;
}

/** Asset unit as seen by the loan flow when checking availability. */
export interface LoanableUnitRow {
  id: string;
  unitNumber: string;
  statusId: string;
  asset: { name: string };
  status: { allowTransactions: boolean } | null;
}

export interface LoanQueryInput extends PaginationQueryInput {
  keyword?: string;
  statusId?: string;
  requesterId?: string;
}

export interface InventoryHistoryQueryInput extends PaginationQueryInput {
  unitId?: string;
}

export interface CreateLoanRepositoryInput {
  loanNumber: string;
  requesterId: string;
  expectedReturnDate: Date;
  purpose: string;
  statusId: string;
  workflowInstanceId?: string | null;
}

export interface UpdateLoanRepositoryInput {
  expectedReturnDate?: Date;
  actualReturnDate?: Date | null;
  purpose?: string;
  statusId?: string;
  workflowInstanceId?: string | null;
}

export interface CreateInventoryHistoryInput {
  unitId: string;
  transactionTypeId: string;
  previousConditionId?: string | null;
  newConditionId?: string | null;
  previousStatusId?: string | null;
  newStatusId?: string | null;
  previousLocationId?: string | null;
  newLocationId?: string | null;
  previousCustodianId?: string | null;
  newCustodianId?: string | null;
  note?: string | null;
  changedById: string;
}

export interface ProcessCreateLoanInput {
  loanNumber: string;
  requesterId: string;
  expectedReturnDate: Date;
  purpose: string;
  pendingStatusId: string;
  unitIds: string[];
  units: { id: string; statusId: string }[];
}

export interface ProcessReturnLoanInput {
  loanId: string;
  returnedStatusId: string;
  availStatusId: string;
  txTypeId: string;
  changedById: string;
  loanNumber: string;
  items: { unitId: string; conditionId: string; note?: string }[];
}

export abstract class ICirculationRepository {
  abstract findAllLoans(
    query: LoanQueryInput,
  ): Promise<PaginatedResult<LoanWithRelations>>;
  abstract findLoanById(id: string): Promise<LoanWithRelations | null>;
  abstract createLoan(
    input: CreateLoanRepositoryInput,
  ): Promise<LoanWithRelations>;
  abstract updateLoan(
    id: string,
    input: UpdateLoanRepositoryInput,
  ): Promise<LoanWithRelations>;
  abstract findLatestLoan(): Promise<LoanWithRelations | null>;

  abstract findAllHistories(
    query: InventoryHistoryQueryInput,
  ): Promise<PaginatedResult<InventoryHistoryRow>>;
  abstract createHistory(
    input: CreateInventoryHistoryInput,
  ): Promise<InventoryHistoryRow>;

  abstract findStatusByCode(code: string): Promise<InventoryStatusRow | null>;
  abstract findStatusBySystemKey(
    systemKey: string,
  ): Promise<InventoryStatusRow | null>;
  abstract findTransactionTypeByCode(
    code: string,
  ): Promise<InventoryTransactionTypeRow | null>;
  abstract findUnitsByIds(ids: string[]): Promise<LoanableUnitRow[]>;

  abstract processCreateLoanTransaction(
    params: ProcessCreateLoanInput,
  ): Promise<LoanWithRelations>;

  abstract processReturnLoanTransaction(
    params: ProcessReturnLoanInput,
  ): Promise<LoanWithRelations>;
}
