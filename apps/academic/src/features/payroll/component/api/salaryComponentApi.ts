import type { ApiSingleResponse } from '@/shared/types/api'
import api from '@/shared/utils/api'
import type { SalaryComponent, SalaryComponentSavePayload } from '../types'

export const salaryComponentApi = {
  getComponents: (includeInactive = true) =>
    api.get<ApiSingleResponse<SalaryComponent[]>>('/payroll/components', {
      params: { includeInactive },
    }),

  createComponent: (payload: SalaryComponentSavePayload) =>
    api.post<ApiSingleResponse<SalaryComponent>>(
      '/payroll/components',
      payload,
    ),

  updateComponent: (id: string, payload: Partial<SalaryComponentSavePayload>) =>
    api.patch<ApiSingleResponse<SalaryComponent>>(
      `/payroll/components/${id}`,
      payload,
    ),

  deleteComponent: (id: string) => api.delete(`/payroll/components/${id}`),
}
