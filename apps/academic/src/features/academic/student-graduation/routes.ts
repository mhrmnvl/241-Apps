import type { RouteRecordRaw } from 'vue-router'

export const studentGraduationRoutes: RouteRecordRaw[] = [
  {
    path: '/alumni',
    name: 'student-graduation',
    component: () => import('./views/StudentGraduationView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['ADMIN', 'TEACHER'],
      title: 'Daftar Alumni',
    },
  },
]
