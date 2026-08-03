import type { RouteRecordRaw } from 'vue-router'

export const gradeRoutes: RouteRecordRaw[] = [
  {
    path: '/academic/grade',
    name: 'grade',
    component: () => import('./views/GradeView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'academic-years.read',
      title: 'Tingkat Kelas',
      breadcrumbs: [
        { title: 'Akademik', href: '#' },
        { title: 'Tingkat Kelas', href: '/academic/grade' },
      ],
    },
  },
]
