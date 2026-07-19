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

export interface InventoryStatus {
  id: string
  code: string
  name: string
  allowTransactions: boolean
  createdAt: string
}

export interface InventoryFundingSource {
  id: string
  code: string
  name: string
  description: string | null
  createdAt: string
}

export interface InventoryAsset {
  id: string
  assetNumber: string
  barcode: string | null
  name: string
  categoryId: string
  brand: string | null
  model: string | null
  serialNumber: string | null
  purchaseDate: string
  purchasePrice: number
  residualValue: number
  usefulLifeMonths: number
  currentBookValue: number
  fundingSourceId: string | null
  imageUrl: string | null
  conditionId: string
  statusId: string
  locationId: string
  custodianId: string | null
  notes: string | null
  version: number
  createdAt: string
  updatedAt: string
  deletedAt: string | null

  category: InventoryCategory
  location: InventoryLocation
  condition: InventoryCondition
  status: InventoryStatus
  fundingSource: InventoryFundingSource | null
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
  serialNumber?: string
  barcode?: string
  purchaseDate: string
  purchasePrice: number
  usefulLifeMonths?: number
  fundingSourceId?: string | null
  locationId: string
  statusId: string
  conditionId: string
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
}

export interface InventoryLoanItem {
  id: string
  loanId: string
  assetId: string
  returnedConditionId: string | null
  notes: string | null
  asset?: InventoryAsset
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
  assetIds: string[]
}

export interface ReturnLoanItemPayload {
  assetId: string
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
  assetId: string
  transactionTypeId: string
  previousConditionId: string | null
  newConditionId: string | null
  previousStatusId: string | null
  newStatusId: string | null
  note: string | null
  changedById: string
  changedAt: string
  asset?: InventoryAsset
  transactionType?: InventoryTransactionType
}

export interface HistoryQueryParams {
  page: number
  limit: number
  assetId?: string
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
