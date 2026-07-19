import type { RouteRecordRaw } from 'vue-router'

export const raporRoutes: RouteRecordRaw[] = [
  {
    path: '/akademik/rapor',
    name: 'rapor',
    component: () => import('./views/RaporView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['ADMIN', 'TEACHER', 'STUDENT'],
      title: 'Rapor Siswa',
    },
  },
]
