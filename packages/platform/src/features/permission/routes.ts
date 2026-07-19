import type { RouteRecordRaw } from 'vue-router'

export const permissionsRoutes: RouteRecordRaw[] = [
  {
    path: '/pengaturan/permissions',
    name: 'Permissions',
    component: () => import('./views/PermissionsView.vue'),
    meta: {
      title: 'Manajemen Permission',
      requiresAuth: true,
      allowedRoles: ['ADMIN', 'SUPER_ADMIN'],
    },
  },
]
