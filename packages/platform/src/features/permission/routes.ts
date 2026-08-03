import type { RouteRecordRaw } from 'vue-router'

export const permissionsRoutes: RouteRecordRaw[] = [
  {
    path: '/setting/permission',
    name: 'Permissions',
    component: () => import('./views/PermissionsView.vue'),
    meta: {
      title: 'Manajemen Permission',
      requiresAuth: true,
      requiredPermission: 'permissions.manage',
      breadcrumbs: [
        { title: 'Pengaturan', href: '#' },
        { title: 'Manajemen Permission', href: '/setting/permission' },
      ],
    },
  },
]
