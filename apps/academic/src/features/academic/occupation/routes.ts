import type { RouteRecordRaw } from 'vue-router'

export const occupationRoutes: RouteRecordRaw[] = [
  {
    path: '/occupations',
    name: 'OccupationList',
    component: () => import('./views/OccupationListView.vue'),
    meta: {
      title: 'Pekerjaan',
      requiresAuth: true,
      allowedRoles: ['ADMIN', 'TEACHER'],
    },
  },
]
