import type { RouteRecordRaw } from 'vue-router'

export const academicCalendarRoutes: RouteRecordRaw[] = [
  {
    path: '/akademik/kalender-pendidikan',
    name: 'academic-calendar',
    component: () => import('./views/AcademicCalendarView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'academic-calendars.read',
      title: 'Kalender Pendidikan',
    },
  },
]
