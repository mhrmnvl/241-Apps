import type { RouteRecordRaw } from 'vue-router'

export const parentRoutes: RouteRecordRaw[] = [
  {
    path: '/data-master/orang-tua',
    name: 'parent',
    component: () => import('./views/ParentView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'parents.read',
      title: 'Data Orang Tua',
    },
  },
]
