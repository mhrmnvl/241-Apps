import type { RouteRecordRaw } from 'vue-router'

export const rolesRoutes: RouteRecordRaw[] = [
  {
    path: '/pengaturan/roles',
    name: 'Roles',
    component: () => import('./views/RolesView.vue'),
    meta: {
      title: 'Manajemen Role',
      requiresAuth: true,
      allowedRoles: ['ADMIN', 'SUPER_ADMIN'],
    },
  },
]
