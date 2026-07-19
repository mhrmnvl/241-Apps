export interface Permission {
  id: string
  code: string
  name: string
  description?: string | null
  module?: string | null
}

export interface Role {
  id: string
  code: string
  name: string
  description?: string | null
  isSystem: boolean
  permissions: Permission[]
  createdAt?: string
  updatedAt?: string
}

export interface CreateRolePayload {
  code: string
  name: string
  description?: string
  permissionIds?: string[]
}

export interface UpdateRolePayload {
  name: string
  description?: string
  permissionIds?: string[]
}
