import type { RouteRecordRaw } from 'vue-router'

export const studentGraduationRoutes: RouteRecordRaw[] = [
  {
    /**
     * Graduating a cohort, beside Kenaikan Kelas because they are the two
     * halves of moving a school into its next year: one sends everybody up,
     * the other sends the top year out.
     */
    path: '/academic/graduation',
    name: 'graduation',
    component: () => import('./views/GraduationView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'graduations.read',
      title: 'Kelulusan',
      breadcrumbs: [
        { title: 'Periode Akademik', href: '#' },
        { title: 'Kelulusan', href: '/academic/graduation' },
      ],
    },
  },
  {
    path: '/student/alumni',
    name: 'student-graduation',
    component: () => import('./views/StudentGraduationView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'graduations.read',
      title: 'Alumni',
      breadcrumbs: [
        { title: 'Siswa', href: '#' },
        { title: 'Alumni', href: '/student/alumni' },
      ],
    },
  },
]
