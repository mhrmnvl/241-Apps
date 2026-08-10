import type { ApiSingleResponse } from '@/shared/types/api'
import api from '@/shared/utils/api'
import type {
  LeaveBalance,
  LeaveRequest,
  LeaveType,
  SubmitLeavePayload,
} from '../types'

export const leaveApi = {
  getTypes: () =>
    api.get<ApiSingleResponse<LeaveType[]>>('/presence/leave-types'),

  getRequests: (params?: { status?: string; year?: number }) =>
    api.get<ApiSingleResponse<LeaveRequest[]>>('/presence/leave-requests', {
      params,
    }),

  /** No user parameter — the API resolves it from the session. */
  getMyRequests: (params?: { year?: number }) =>
    api.get<ApiSingleResponse<LeaveRequest[]>>('/presence/leave-requests/me', {
      params,
    }),

  submit: (payload: SubmitLeavePayload) =>
    api.post<ApiSingleResponse<LeaveRequest>>(
      '/presence/leave-requests',
      payload,
    ),

  approve: (id: string) =>
    api.post<ApiSingleResponse<LeaveRequest>>(
      `/presence/leave-requests/${id}/approve`,
      {},
    ),

  reject: (id: string, reason: string) =>
    api.post<ApiSingleResponse<LeaveRequest>>(
      `/presence/leave-requests/${id}/reject`,
      { reason },
    ),

  withdraw: (id: string) =>
    api.post<ApiSingleResponse<LeaveRequest>>(
      `/presence/leave-requests/${id}/withdraw`,
      {},
    ),

  getMyBalances: (year?: number) =>
    api.get<ApiSingleResponse<LeaveBalance[]>>('/presence/leave-balances/me', {
      params: year ? { year } : undefined,
    }),
}
