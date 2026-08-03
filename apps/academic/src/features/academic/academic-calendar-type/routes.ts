import type { RouteRecordRaw } from 'vue-router'

export const academicCalendarTypeRoutes: RouteRecordRaw[] = [
  {
    path: '/setting/academic-calendar-type',
    name: 'AcademicCalendarTypeList',
    component: () => import('./views/AcademicCalendarTypeListView.vue'),
    meta: {
      title: 'Tipe Kalender',
      requiresAuth: true,
      requiredPermission: 'academic-calendar-types.read',
      breadcrumbs: [
        { title: 'Pengaturan', href: '#' },
        { title: 'Tipe Kalender', href: '/setting/academic-calendar-type' },
      ],
    },
  },
]
