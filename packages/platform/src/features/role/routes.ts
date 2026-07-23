import type { RouteRecordRaw } from 'vue-router'

export const rolesRoutes: RouteRecordRaw[] = [
  {
    path: '/setting/role',
    name: 'Roles',
    component: () => import('./views/RolesView.vue'),
    meta: {
      title: 'Manajemen Role',
      requiresAuth: true,
      requiredPermission: 'roles.read',
    },
  },
  {
    path: '/setting/role/create',
    name: 'RoleCreate',
    component: () => import('./views/RoleFormView.vue'),
    meta: {
      title: 'Tambah Role',
      requiresAuth: true,
      requiredPermission: 'roles.read',
    },
  },
  {
    path: '/setting/role/:id/edit',
    name: 'RoleEdit',
    component: () => import('./views/RoleFormView.vue'),
    meta: {
      title: 'Edit Role',
      requiresAuth: true,
      requiredPermission: 'roles.read',
    },
  },
]
