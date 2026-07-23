import type { RouteRecordRaw } from 'vue-router'

export const auditLogsRoutes: RouteRecordRaw[] = [
  {
    path: '/setting/audit-log',
    name: 'AuditLogs',
    component: () => import('./views/AuditLogsView.vue'),
    meta: {
      title: 'Log Aktivitas',
      requiresAuth: true,
      requiredPermission: 'audit-logs.read',
    },
  },
]
