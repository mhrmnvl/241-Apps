import type { RouteRecordRaw } from 'vue-router'

export const announcementRoutes: RouteRecordRaw[] = [
  {
    path: '/announcement',
    name: 'announcement',
    component: () => import('./views/AnnouncementView.vue'),
    meta: {
      requiresAuth: true,
      // Two ways in, as the menu entry says: the whole board for whoever
      // keeps it, what is addressed to you for everyone else. Gated on the
      // wide read alone, a student was offered the entry and then bounced to
      // the dashboard.
      requiredAnyPermission: ['announcements.read', 'announcements.read-own'],
      title: 'Pengumuman',
      breadcrumbs: [
        { title: 'Utama', href: '#' },
        { title: 'Pengumuman', href: '/announcement' },
      ],
    },
  },
]
