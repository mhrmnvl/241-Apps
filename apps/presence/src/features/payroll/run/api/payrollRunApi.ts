import type { ApiSingleResponse } from '@/shared/types/api'
import api from '@/shared/utils/api'
import type {
  CreatePayrollRunPayload,
  PayrollRun,
  PayrollRunStatus,
  PayslipSummary,
} from '../types'

export const payrollRunApi = {
  getRuns: (params?: { year?: number; status?: PayrollRunStatus }) =>
    api.get<ApiSingleResponse<PayrollRun[]>>('/payroll/runs', { params }),

  getRun: (id: string) =>
    api.get<ApiSingleResponse<PayrollRun>>(`/payroll/runs/${id}`),

  getRunPayslips: (id: string) =>
    api.get<ApiSingleResponse<PayslipSummary[]>>(
      `/payroll/runs/${id}/payslips`,
    ),

  createRun: (payload: CreatePayrollRunPayload) =>
    api.post<ApiSingleResponse<PayrollRun>>('/payroll/runs', payload),

  recalculateRun: (id: string) =>
    api.post<ApiSingleResponse<PayrollRun>>(
      `/payroll/runs/${id}/recalculate`,
      {},
    ),

  submitRun: (id: string) =>
    api.post<ApiSingleResponse<PayrollRun>>(`/payroll/runs/${id}/submit`, {}),

  approveRun: (id: string) =>
    api.post<ApiSingleResponse<PayrollRun>>(`/payroll/runs/${id}/approve`, {}),
}
