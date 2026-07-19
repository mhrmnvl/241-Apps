import api from '@/shared/utils/api'
import type { ApiPaginatedResponse } from '@/shared/types/api'
import type { AuditLog, AuditLogQueryParams } from '../types'

export const auditLogsApi = {
  getAuditLogs: (params?: AuditLogQueryParams) => {
    return api.get<ApiPaginatedResponse<AuditLog>>('/audit-logs', { params })
  },
}
