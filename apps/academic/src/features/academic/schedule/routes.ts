import type { RouteRecordRaw } from 'vue-router'

export const scheduleRoutes: RouteRecordRaw[] = [
  {
    path: '/academic/my/schedule',
    name: 'my-schedule',
    component: () => import('./views/MyScheduleView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'schedules.read-own',
      title: 'Jadwal Saya',
      breadcrumbs: [{ title: 'Akademik Saya', href: '#' }, { title: 'Jadwal' }],
    },
  },
  {
    path: '/schedule',
    name: 'schedule-view',
    component: () => import('./views/ScheduleView.vue'),
    meta: { requiresAuth: true, title: 'Lihat Jadwal' },
  },
]
