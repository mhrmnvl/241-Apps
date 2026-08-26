import type { RouteRecordRaw } from 'vue-router'

export const academicYearRoutes: RouteRecordRaw[] = [
  {
    path: '/academic/academic-year',
    name: 'academic-year',
    component: () => import('./views/AcademicYearView.vue'),
    meta: {
      requiresAuth: true,
      // Management, like its menu entry — the read alone is held widely.
      requiredPermission: 'academic-years.update',
      title: 'Tahun Ajaran',
      breadcrumbs: [
        { title: 'Akademik', href: '#' },
        { title: 'Tahun Ajaran', href: '/academic/academic-year' },
      ],
    },
  },
]
