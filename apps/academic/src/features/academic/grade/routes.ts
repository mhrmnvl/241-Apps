import type { RouteRecordRaw } from 'vue-router'

export const gradeRoutes: RouteRecordRaw[] = [
  {
    path: '/akademik/tingkat-kelas',
    name: 'grade',
    component: () => import('./views/GradeView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'academic-years.read',
      title: 'Tingkat Kelas',
    },
  },
]
