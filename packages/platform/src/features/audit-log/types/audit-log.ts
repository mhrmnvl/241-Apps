export interface AuditLogUser {
  id: string
  identifier: string
}

export interface AuditLog {
  id: string
  organizationId?: string | null
  userId?: string | null
  action: string
  resource: string
  resourceId?: string | null
  metadata?: Record<string, string | number | boolean | null | object> | null
  ipAddress?: string | null
  userAgent?: string | null
  createdAt: string
  user?: AuditLogUser | null
}
