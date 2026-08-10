import type { ApiSingleResponse } from '@/shared/types/api'
import api from '@/shared/utils/api'
import type { SalaryAssignment, SalaryAssignmentSavePayload } from '../types'

export const salaryAssignmentApi = {
  getAssignments: (userId?: string) =>
    api.get<ApiSingleResponse<SalaryAssignment[]>>('/payroll/assignments', {
      params: userId ? { userId } : undefined,
    }),

  createAssignment: (payload: SalaryAssignmentSavePayload) =>
    api.post<ApiSingleResponse<SalaryAssignment>>(
      '/payroll/assignments',
      payload,
    ),

  deleteAssignment: (id: string) => api.delete(`/payroll/assignments/${id}`),
}
