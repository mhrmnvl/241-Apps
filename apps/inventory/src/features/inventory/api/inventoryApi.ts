import api from '@/shared/utils/api'
import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'
import type {
  InventoryAsset,
  InventoryMetadata,
  AssetSavePayload,
  AssetQueryParams,
  InventoryReferenceItem,
  InventoryLoan,
  LoanQueryParams,
  CreateLoanPayload,
  ReturnLoanPayload,
  InventoryHistory,
  HistoryQueryParams,
  ApprovalWorkflow,
  CreateWorkflowPayload,
  ApprovalInstance,
  ProcessApprovalPayload,
  ProcessApprovalResult,
} from '../types'

const typeEndpointMap: Record<string, string> = {
  categories: '/inventory/categories',
  locations: '/inventory/locations',
  conditions: '/inventory/conditions',
  statuses: '/inventory/statuses',
  'funding-sources': '/inventory/funding-sources',
}

export const inventoryApi = {
  getAssets: (params?: AssetQueryParams) => {
    return api.get<ApiPaginatedResponse<InventoryAsset>>('/inventory/assets', {
      params,
    })
  },

  getAssetById: (id: string) => {
    return api.get<ApiSingleResponse<InventoryAsset>>(`/inventory/assets/${id}`)
  },

  createAsset: (payload: AssetSavePayload) => {
    return api.post<ApiSingleResponse<InventoryAsset>>(
      '/inventory/assets',
      payload,
    )
  },

  updateAsset: (id: string, payload: Partial<AssetSavePayload>) => {
    return api.patch<ApiSingleResponse<InventoryAsset>>(
      `/inventory/assets/${id}`,
      payload,
    )
  },

  deleteAsset: (id: string) => {
    return api.delete<void>(`/inventory/assets/${id}`)
  },

  getInventoryMetadata: () => {
    return api.get<ApiSingleResponse<InventoryMetadata>>('/inventory/metadata')
  },

  getLoans: (params?: LoanQueryParams) => {
    return api.get<ApiPaginatedResponse<InventoryLoan>>('/inventory/loans', {
      params,
    })
  },

  getLoanById: (id: string) => {
    return api.get<ApiSingleResponse<InventoryLoan>>(`/inventory/loans/${id}`)
  },

  createLoan: (payload: CreateLoanPayload) => {
    return api.post<ApiSingleResponse<InventoryLoan>>(
      '/inventory/loans',
      payload,
    )
  },

  returnLoan: (id: string, payload: ReturnLoanPayload) => {
    return api.post<ApiSingleResponse<InventoryLoan>>(
      `/inventory/loans/${id}/return`,
      payload,
    )
  },

  getHistories: (params?: HistoryQueryParams) => {
    return api.get<ApiPaginatedResponse<InventoryHistory>>(
      '/inventory/histories',
      { params },
    )
  },

  getWorkflows: () => {
    return api.get<ApiSingleResponse<ApprovalWorkflow[]>>(
      '/inventory/workflows',
    )
  },

  createWorkflow: (payload: CreateWorkflowPayload) => {
    return api.post<ApiSingleResponse<ApprovalWorkflow>>(
      '/inventory/workflows',
      payload,
    )
  },

  getPendingApprovals: () => {
    return api.get<ApiSingleResponse<ApprovalInstance[]>>(
      '/inventory/approvals',
    )
  },

  processApproval: (id: string, payload: ProcessApprovalPayload) => {
    return api.post<ApiSingleResponse<ProcessApprovalResult>>(
      `/inventory/approvals/${id}/action`,
      payload,
    )
  },

  // Generic Reference CRUD bindings mapping to specific backend sub-module controllers
  getReferences: (type: string, search?: string) => {
    const path = typeEndpointMap[type] ?? `/inventory/${type}`
    return api.get<ApiSingleResponse<InventoryReferenceItem[]>>(path, {
      params: { search },
    })
  },

  createReference: (
    type: string,
    payload: Omit<InventoryReferenceItem, 'id'>,
  ) => {
    const path = typeEndpointMap[type] ?? `/inventory/${type}`
    return api.post<ApiSingleResponse<InventoryReferenceItem>>(path, payload)
  },

  updateReference: (
    type: string,
    id: string,
    payload: Partial<InventoryReferenceItem>,
  ) => {
    const path = typeEndpointMap[type] ?? `/inventory/${type}`
    return api.patch<ApiSingleResponse<InventoryReferenceItem>>(
      `${path}/${id}`,
      payload,
    )
  },

  deleteReference: (type: string, id: string) => {
    const path = typeEndpointMap[type] ?? `/inventory/${type}`
    return api.delete<void>(`${path}/${id}`)
  },
}
