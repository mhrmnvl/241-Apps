import type { RouteRecordRaw } from 'vue-router'

export const positionRoutes: RouteRecordRaw[] = [
  {
    path: '/pengaturan/jabatan',
    name: 'positions',
    component: () => import('./views/PositionView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'positions.read',
      title: 'Kelola Jabatan',
    },
  },
]
