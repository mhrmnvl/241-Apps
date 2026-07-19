import type { RouteRecordRaw } from 'vue-router'

export const tenantRoutes: RouteRecordRaw[] = [
  {
    path: '/tenants',
    name: 'tenants',
    component: () => import('./views/TenantView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['SUPER_ADMIN'],
      title: 'Manajemen Tenant',
    },
  },
]
