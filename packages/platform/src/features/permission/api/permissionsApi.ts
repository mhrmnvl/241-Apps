import api from '@/shared/utils/api'
import type { ApiSingleResponse } from '@/shared/types/api'
import type {
  Permission,
  CreatePermissionPayload,
  UpdatePermissionPayload,
} from '../types'

export const permissionsApi = {
  getPermissions: () => {
    return api.get<ApiSingleResponse<Permission[]>>('/permissions')
  },
  createPermission: (payload: CreatePermissionPayload) => {
    return api.post<ApiSingleResponse<Permission>>('/permissions', payload)
  },
  updatePermission: (id: string, payload: UpdatePermissionPayload) => {
    return api.patch<ApiSingleResponse<Permission>>(
      `/permissions/${id}`,
      payload,
    )
  },
  deletePermission: (id: string) => {
    return api.delete<void>(`/permissions/${id}`)
  },
  syncPermissions: () => {
    return api.post<ApiSingleResponse<{ message: string }>>(
      '/permissions/sync',
      {},
    )
  },
}
