import type { RouteRecordRaw } from 'vue-router'

export const settingsRoutes: RouteRecordRaw[] = [
  {
    path: '/maintenance',
    name: 'maintenance',
    component: () => import('./views/MaintenanceView.vue'),
  },
]
