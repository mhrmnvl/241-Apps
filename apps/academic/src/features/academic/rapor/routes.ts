import type { RouteRecordRaw } from 'vue-router'

export const raporRoutes: RouteRecordRaw[] = [
  {
    // The student's own screen. A new path on purpose: `/academic/report-card`
    // belongs to the management console and keeps it.
    path: '/academic/my/report-card',
    name: 'my-rapor',
    component: () => import('./views/MyRaporView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'report-cards.read-own',
      title: 'Rapor Saya',
      breadcrumbs: [{ title: 'Akademik Saya', href: '#' }, { title: 'Rapor' }],
    },
  },
  {
    path: '/academic/report-card',
    name: 'rapor',
    component: () => import('./views/RaporView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'report-cards.read',
      title: 'Rapor Siswa',
      breadcrumbs: [
        { title: 'Manajemen Akademik', href: '#' },
        { title: 'Rapor Siswa', href: '/academic/report-card' },
      ],
    },
  },
]
