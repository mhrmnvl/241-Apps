import type { RouteRecordRaw } from 'vue-router'

export const announcementRoutes: RouteRecordRaw[] = [
  {
    path: '/pengumuman',
    name: 'announcement',
    component: () => import('./views/AnnouncementView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'announcements.read',
      title: 'Pengumuman',
    },
  },
]
