import type { RouteRecordRaw } from 'vue-router'

export const academicCalendarTypeRoutes: RouteRecordRaw[] = [
  {
    path: '/pengaturan/academic-calendar-type',
    name: 'AcademicCalendarTypeList',
    component: () => import('./views/AcademicCalendarTypeListView.vue'),
    meta: {
      title: 'Tipe Kalender',
      requiresAuth: true,
      requiredPermission: 'academic-calendar-types.read',
    },
  },
]
