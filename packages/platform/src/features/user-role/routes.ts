import type { RouteRecordRaw } from 'vue-router'

export const userRoleRoutes: RouteRecordRaw[] = [
  {
    path: '/pengaturan/kelola-pengguna',
    name: 'UserRole',
    component: () => import('./views/UserRoleView.vue'),
    meta: {
      title: 'Kelola Pengguna',
      requiresAuth: true,
      allowedRoles: ['ADMIN'],
    },
  },
]
