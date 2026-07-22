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

// Admin edit of another user's account credentials. Both optional: send only
// what changed. Empty/omitted password leaves the current one untouched.
export interface UpdateUserAccountPayload {
  identifier?: string
  password?: string
}
