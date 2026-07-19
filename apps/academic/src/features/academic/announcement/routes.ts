import type { RouteRecordRaw } from 'vue-router'

export const announcementRoutes: RouteRecordRaw[] = [
  {
    path: '/pengumuman',
    name: 'announcement',
    component: () => import('./views/AnnouncementView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['ADMIN', 'TEACHER', 'STUDENT'],
      title: 'Pengumuman',
    },
  },
]
