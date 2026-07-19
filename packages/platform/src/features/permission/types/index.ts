export interface Permission {
  id: string
  module: string
  action: string
  code: string
  description?: string | null
  createdAt?: string
  updatedAt?: string
}

export interface CreatePermissionPayload {
  module: string
  action: string
  description?: string
}

export interface UpdatePermissionPayload {
  description?: string
}
