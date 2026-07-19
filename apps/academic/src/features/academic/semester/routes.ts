import type { RouteRecordRaw } from 'vue-router'

export const semesterRoutes: RouteRecordRaw[] = [
  {
    path: '/akademik/semester',
    name: 'semester',
    component: () => import('./views/SemesterView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['ADMIN', 'TEACHER'],
      title: 'Semester',
    },
  },
  {
    path: '/akademik/semester/kenaikan-kelas',
    name: 'promotion',
    component: () => import('./views/PromotionView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['ADMIN'],
      title: 'Kenaikan Kelas',
    },
  },
]
