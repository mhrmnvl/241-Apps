import type { RouteRecordRaw } from 'vue-router'

export const announcementRoutes: RouteRecordRaw[] = [
  {
    path: '/announcement',
    name: 'announcement',
    component: () => import('./views/AnnouncementView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'announcements.read',
      title: 'Pengumuman',
      breadcrumbs: [
        { title: 'Utama', href: '#' },
        { title: 'Pengumuman', href: '/announcement' },
      ],
    },
  },
]
