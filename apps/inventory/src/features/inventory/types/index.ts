export interface InventoryCategory {
  id: string
  code: string
  name: string
  parentId: string | null
  depreciationRatePercent: number
  createdAt: string
}

export interface InventoryLocation {
  id: string
  code: string
  name: string
  building: string | null
  room: string | null
  rack: string | null
  description: string | null
  createdAt: string
}

export interface InventoryCondition {
  id: string
  code: string
  name: string
  isUsable: boolean
  createdAt: string
}

// Protected role a status plays in the loan lifecycle (create/approve/reject/
// return) — assigned by an admin via Referensi > Status Aset, independent of
// the freely-editable code/name. Business logic must check this, never code.
export type InventoryStatusKey =
  | 'AVAILABLE'
  | 'LOAN_PENDING'
  | 'LOAN_APPROVED'
  | 'LOANED'
  | 'LOAN_RETURNED'
  | 'LOAN_REJECTED'

export interface InventoryStatus {
  id: string
  code: string
  name: string
  allowTransactions: boolean
  systemKey: InventoryStatusKey | null
  createdAt: string
}

export interface InventoryFundingSource {
  id: string
  code: string
  name: string
  description: string | null
  createdAt: string
}

// Parent = asset definition / batch (catalog). Physical units live in `units`.
export interface InventoryAsset {
  id: string
  assetNumber: string
  name: string
  categoryId: string
  brand: string | null
  model: string | null
  purchaseDate: string
  purchasePrice: number
  usefulLifeMonths: number
  fundingSourceId: string | null
  imageUrl: string | null
  notes: string | null
  version: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null

  category: InventoryCategory
  fundingSource: InventoryFundingSource | null
  units: InventoryAssetUnit[]
}

// Child = individual physical unit (each numbered/labelled and loanable).
export interface InventoryAssetUnit {
  id: string
  assetId: string
  unitNumber: string
  barcode: string | null
  serialNumber: string | null
  residualValue: number
  currentBookValue: number
  conditionId: string
  statusId: string
  locationId: string
  custodianId: string | null
  notes: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null

  condition?: InventoryCondition
  status?: InventoryStatus
  location?: InventoryLocation
  asset?: InventoryAsset
}

// Flattened unit for label printing — carries its own asset name so a single
// label sheet can mix units from different assets (cross-asset batch print).
export interface LabelUnit {
  id: string
  unitNumber: string
  barcode: string | null
  assetName: string
}

export interface InventoryMetadata {
  categories: InventoryCategory[]
  locations: InventoryLocation[]
  conditions: InventoryCondition[]
  statuses: InventoryStatus[]
  fundingSources: InventoryFundingSource[]
}

export interface AssetSavePayload {
  name: string
  categoryId: string
  brand?: string
  model?: string
  purchaseDate: string
  purchasePrice: number
  fundingSourceId?: string | null
  notes?: string
  // unit defaults + quantity (create only)
  quantity?: number
  conditionId?: string
  statusId?: string
  locationId?: string
  serialNumber?: string
}

export interface AddUnitsPayload {
  quantity?: number
  conditionId: string
  statusId: string
  locationId: string
}

export interface AssetUnitUpdatePayload {
  conditionId?: string
  statusId?: string
  locationId?: string
  custodianId?: string
  serialNumber?: string
  barcode?: string
  notes?: string
}

export interface AssetQueryParams {
  page: number
  limit: number
  keyword?: string
  categoryId?: string
  locationId?: string
  statusId?: string
  conditionId?: string
}

export interface InventoryReferenceItem {
  id: string
  code: string
  name: string
  depreciationRatePercent?: number
  building?: string
  room?: string
  rack?: string
  description?: string
  isUsable?: boolean
  allowTransactions?: boolean
  /** Statuses only — protected loan-lifecycle role, see InventoryStatusKey. */
  systemKey?: InventoryStatusKey | null
}

export interface InventoryLoanItem {
  id: string
  loanId: string
  unitId: string
  returnedConditionId: string | null
  notes: string | null
  unit?: InventoryAssetUnit
}

export interface InventoryLoan {
  id: string
  loanNumber: string
  requesterId: string
  expectedReturnDate: string
  actualReturnDate: string | null
  purpose: string
  statusId: string
  workflowInstanceId: string | null
  createdAt: string
  updatedAt: string
  items: InventoryLoanItem[]
}

export interface LoanQueryParams {
  page: number
  limit: number
  keyword?: string
  statusId?: string
  requesterId?: string
}

export interface CreateLoanPayload {
  purpose: string
  expectedReturnDate: string
  unitIds: string[]
}

export interface ReturnLoanItemPayload {
  unitId: string
  returnedConditionId: string
  notes?: string
}

export interface ReturnLoanPayload {
  items: ReturnLoanItemPayload[]
}

export interface InventoryTransactionType {
  id: string
  code: string
  name: string
  direction: string
  description: string | null
}

export interface InventoryHistory {
  id: string
  unitId: string
  transactionTypeId: string
  previousConditionId: string | null
  newConditionId: string | null
  previousStatusId: string | null
  newStatusId: string | null
  note: string | null
  changedById: string
  changedAt: string
  unit?: InventoryAssetUnit
  transactionType?: InventoryTransactionType
}

export interface HistoryQueryParams {
  page: number
  limit: number
  unitId?: string
}

export interface ApprovalStep {
  id: string
  workflowId: string
  stepSequence: number
  approverRoleId: string
  isMandatory: boolean
}

export interface ApprovalWorkflow {
  id: string
  name: string
  targetEntity: string
  description: string | null
  isActive: boolean
  steps: ApprovalStep[]
}

export interface CreateWorkflowStepPayload {
  stepSequence: number
  approverRoleId: string
  isMandatory?: boolean
}

export interface CreateWorkflowPayload {
  name: string
  targetEntity: string
  description?: string
  steps: CreateWorkflowStepPayload[]
}

export interface ApprovalLog {
  id: string
  instanceId: string
  stepSequence: number
  approverId: string
  actionId: string
  note: string | null
  createdAt: string
}

export interface ApprovalInstance {
  id: string
  workflowId: string
  referenceId: string
  currentStepSequence: number
  statusId: string
  createdAt: string
  workflow?: ApprovalWorkflow
  logs?: ApprovalLog[]
  details?: InventoryLoan | null
}

export interface ProcessApprovalPayload {
  action: 'APPROVE' | 'REJECT'
  note?: string
}

export interface ProcessApprovalResult {
  success: boolean
  action: 'APPROVE_STEP' | 'APPROVE_FINAL' | 'REJECT'
  log: ApprovalLog
  nextStepSequence?: number
}
