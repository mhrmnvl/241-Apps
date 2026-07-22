import type { RouteRecordRaw } from 'vue-router'

export const eventCalendarRoutes: RouteRecordRaw[] = [
  {
    path: '/akademik/kalender-kegiatan',
    name: 'event-calendar',
    component: () => import('./views/EventCalendarView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'events.read',
      title: 'Kalender Kegiatan',
    },
  },
]
