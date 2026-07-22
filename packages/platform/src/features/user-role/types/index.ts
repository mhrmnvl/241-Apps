export interface UserWithRoles {
  id: string
  identifier: string
  isActive: boolean
  userRoles: { role: { id: string; code: string; name: string } }[]
  createdAt: string
  updatedAt: string
}

export interface UserRoleQueryParams {
  page?: number
  limit?: number
  roleCode?: string
  search?: string
}

export interface AssignRolePayload {
  userId: string
  roleId: string
}
