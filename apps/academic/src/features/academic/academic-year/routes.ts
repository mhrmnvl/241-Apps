import type { RouteRecordRaw } from 'vue-router'

export const academicYearRoutes: RouteRecordRaw[] = [
  {
    path: '/akademik/tahun-ajaran',
    name: 'academic-year',
    component: () => import('./views/AcademicYearView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'academic-years.read',
      title: 'Tahun Ajaran',
    },
  },
]
