import type { RouteRecordRaw } from 'vue-router'

export const semesterRoutes: RouteRecordRaw[] = [
  {
    path: '/academic/semester',
    name: 'semester',
    component: () => import('./views/SemesterView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'semesters.read',
      title: 'Semester',
    },
  },
  {
    path: '/academic/semester/promotion',
    name: 'promotion',
    component: () => import('./views/PromotionView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'semesters.read',
      title: 'Kenaikan Kelas',
    },
  },
]
