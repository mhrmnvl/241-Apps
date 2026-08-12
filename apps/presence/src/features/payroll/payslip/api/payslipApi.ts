import type { ApiSingleResponse } from '@/shared/types/api'
import api from '@/shared/utils/api'
import type { Payslip } from '../types'

export const payslipApi = {
  /** No `userId` parameter by design — the API resolves the caller from the token. */
  getMyPayslip: (params?: { year?: number; month?: number }) =>
    api.get<ApiSingleResponse<Payslip>>('/payroll/payslips/me', { params }),

  getPayslip: (id: string) =>
    api.get<ApiSingleResponse<Payslip>>(`/payroll/payslips/${id}`),
}
