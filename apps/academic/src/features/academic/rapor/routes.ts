import type { RouteRecordRaw } from 'vue-router'

export const raporRoutes: RouteRecordRaw[] = [
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
