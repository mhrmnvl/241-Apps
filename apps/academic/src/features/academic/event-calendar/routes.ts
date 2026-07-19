import type { RouteRecordRaw } from 'vue-router'

export const eventCalendarRoutes: RouteRecordRaw[] = [
  {
    path: '/akademik/kalender-kegiatan',
    name: 'event-calendar',
    component: () => import('./views/EventCalendarView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['ADMIN', 'TEACHER', 'STUDENT'],
      title: 'Kalender Kegiatan',
    },
  },
]
