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
  {
    path: '/pengaturan/roles/tambah',
    name: 'RoleCreate',
    component: () => import('./views/RoleFormView.vue'),
    meta: {
      title: 'Tambah Role',
      requiresAuth: true,
      allowedRoles: ['ADMIN', 'SUPER_ADMIN'],
    },
  },
  {
    path: '/pengaturan/roles/:id/edit',
    name: 'RoleEdit',
    component: () => import('./views/RoleFormView.vue'),
    meta: {
      title: 'Edit Role',
      requiresAuth: true,
      allowedRoles: ['ADMIN', 'SUPER_ADMIN'],
    },
  },
]
