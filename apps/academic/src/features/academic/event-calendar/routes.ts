import type { RouteRecordRaw } from 'vue-router'

export const eventCalendarRoutes: RouteRecordRaw[] = [
  {
    path: '/academic/event-calendar',
    name: 'event-calendar',
    component: () => import('./views/EventCalendarView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'events.read',
      title: 'Kalender Kegiatan',
      breadcrumbs: [
        { title: 'Akademik', href: '#' },
        { title: 'Kalender Kegiatan' },
      ],
    },
  },
]
