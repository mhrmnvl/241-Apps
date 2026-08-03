import type { RouteRecordRaw } from 'vue-router'

export const studentGraduationRoutes: RouteRecordRaw[] = [
  {
    path: '/student/alumni',
    name: 'student-graduation',
    component: () => import('./views/StudentGraduationView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'graduations.read',
      title: 'Daftar Alumni',
      breadcrumbs: [
        { title: 'Data Master', href: '#' },
        { title: 'Daftar Alumni', href: '/student/alumni' },
      ],
    },
  },
]
