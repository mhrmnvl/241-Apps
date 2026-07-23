import type { RouteRecordRaw } from 'vue-router'

export const positionRoutes: RouteRecordRaw[] = [
  {
    path: '/setting/position',
    name: 'positions',
    component: () => import('./views/PositionView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'positions.read',
      title: 'Kelola Jabatan',
    },
  },
]
