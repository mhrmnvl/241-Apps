import type { RouteRecordRaw } from 'vue-router'

export const userRoleRoutes: RouteRecordRaw[] = [
  {
    path: '/setting/user',
    name: 'UserRole',
    component: () => import('./views/UserRoleView.vue'),
    meta: {
      title: 'Kelola Pengguna',
      requiresAuth: true,
      requiredPermission: 'users.read',
      breadcrumbs: [
        { title: 'Pengaturan', href: '#' },
        { title: 'Kelola Pengguna', href: '/setting/user' },
      ],
    },
  },
  {
    path: '/setting/user/:id/edit',
    name: 'UserRoleEdit',
    component: () => import('./views/UserEditView.vue'),
    meta: {
      title: 'Ubah Akun Pengguna',
      requiresAuth: true,
      requiredPermission: 'users.update',
      breadcrumbs: [
        { title: 'Pengaturan', href: '#' },
        { title: 'Kelola Pengguna', href: '/setting/user' },
        { title: 'Ubah Akun' },
      ],
    },
  },
]
