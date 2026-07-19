import type { ApiSingleResponse } from '@/shared/types/api'
import type { TenantProfile } from '../types/tenant.types'
import api from '@/shared/utils/api'

export const tenantApi = {
  getTenants: () => {
    return api.get<ApiSingleResponse<TenantProfile[]>>('/tenants')
  },

  getTenantById: (id: string) => {
    return api.get<ApiSingleResponse<TenantProfile>>(`/tenants/${id}`)
  },

  createTenant: (payload: Partial<TenantProfile>) => {
    return api.post<ApiSingleResponse<TenantProfile>>('/tenants', payload)
  },

  updateTenant: (id: string, payload: Partial<TenantProfile>) => {
    return api.patch<ApiSingleResponse<TenantProfile>>(
      `/tenants/${id}`,
      payload,
    )
  },

  deleteTenant: (id: string) => {
    return api.delete<void>(`/tenants/${id}`)
  },
}
