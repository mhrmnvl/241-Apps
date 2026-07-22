import type { RouteRecordRaw } from 'vue-router'

export const occupationRoutes: RouteRecordRaw[] = [
  {
    path: '/occupations',
    name: 'OccupationList',
    component: () => import('./views/OccupationListView.vue'),
    meta: {
      title: 'Pekerjaan',
      requiresAuth: true,
      requiredPermission: 'occupations.read',
    },
  },
]
