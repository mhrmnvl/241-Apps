import type { RouteRecordRaw } from 'vue-router'

export const curriculaRoutes: RouteRecordRaw[] = [
  {
    path: '/akademik/kurikulum',
    name: 'curricula',
    component: () => import('./views/CurriculaView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['ADMIN', 'TEACHER'],
      title: 'Kurikulum',
    },
  },
]
