import type { ApiSingleResponse } from '@/shared/types/api'
import type { Organization } from '../types'
import api from '@/shared/utils/api'

export const organizationApi = {
  getOrganization: (id: string) => {
    return api.get<ApiSingleResponse<Organization>>(`/organizations/${id}`)
  },

  updateOrganization: (id: string, payload: Partial<Organization>) => {
    return api.patch<ApiSingleResponse<Organization>>(
      `/organizations/${id}`,
      payload,
    )
  },
}
