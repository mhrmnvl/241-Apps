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
      breadcrumbs: [
        { title: 'Akademik', href: '#' },
        { title: 'Semester', href: '/academic/semester' },
      ],
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
      breadcrumbs: [
        { title: 'Akademik', href: '#' },
        { title: 'Semester', href: '/academic/semester' },
        { title: 'Kenaikan Kelas', href: '/academic/semester/promotion' },
      ],
    },
  },
]
