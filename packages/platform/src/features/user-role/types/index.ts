export interface UserWithRoles {
  id: string
  identifier: string
  isActive: boolean
  roles: { id: string; code: string; name: string }[]
  createdAt: string
  updatedAt: string
}

export interface UserRoleQueryParams {
  page?: number
  limit?: number
  roleCode?: string
}

export interface AssignRolePayload {
  userId: string
  roleId: string
}
