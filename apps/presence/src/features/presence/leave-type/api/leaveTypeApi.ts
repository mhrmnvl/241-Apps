import type { ApiSingleResponse } from '@/shared/types/api'
import api from '@/shared/utils/api'
import type { LeaveType, LeaveTypeSavePayload } from '../types'

export const leaveTypeApi = {
  getLeaveTypes: (includeInactive = true) =>
    api.get<ApiSingleResponse<LeaveType[]>>('/presence/leave-types', {
      params: { includeInactive },
    }),

  createLeaveType: (payload: LeaveTypeSavePayload) =>
    api.post<ApiSingleResponse<LeaveType>>('/presence/leave-types', payload),

  updateLeaveType: (id: string, payload: Partial<LeaveTypeSavePayload>) =>
    api.patch<ApiSingleResponse<LeaveType>>(
      `/presence/leave-types/${id}`,
      payload,
    ),

  deleteLeaveType: (id: string) => api.delete(`/presence/leave-types/${id}`),
}
