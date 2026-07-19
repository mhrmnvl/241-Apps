import api from '@/shared/utils/api'
import type { UserWithRoles, UserRoleQueryParams } from '../types'
import type {
  ApiPaginatedResponse,
  ApiSingleResponse,
} from '@/shared/types/api'

export const userRoleApi = {
  getUsers: (params?: UserRoleQueryParams) => {
    return api.get<ApiPaginatedResponse<UserWithRoles>>('/users', { params })
  },
  getRoles: () => {
    return api.get<
      ApiSingleResponse<{ id: string; code: string; name: string }[]>
    >('/roles')
  },
  assignRole: (roleId: string, userId: string) => {
    return api.post<void>(`/roles/${roleId}/assign`, { userId })
  },
  unassignRole: (roleId: string, userId: string) => {
    return api.delete<void>(`/roles/${roleId}/users/${userId}`)
  },
}
