import type { RouteRecordRaw } from 'vue-router'

export const scheduleRoutes: RouteRecordRaw[] = [
  {
    path: '/jadwal',
    name: 'schedule-view',
    component: () => import('./views/ScheduleView.vue'),
    meta: { requiresAuth: true, title: 'Lihat Jadwal' },
  },
]
