import type { RouteRecordRaw } from 'vue-router'

export const userRoleRoutes: RouteRecordRaw[] = [
  {
    path: '/pengaturan/kelola-pengguna',
    name: 'UserRole',
    component: () => import('./views/UserRoleView.vue'),
    meta: {
      title: 'Kelola Pengguna',
      requiresAuth: true,
      requiredPermission: 'users.read',
    },
  },
  {
    path: '/pengaturan/kelola-pengguna/:id/edit',
    name: 'UserRoleEdit',
    component: () => import('./views/UserEditView.vue'),
    meta: {
      title: 'Ubah Akun Pengguna',
      requiresAuth: true,
      requiredPermission: 'users.update',
    },
  },
]
