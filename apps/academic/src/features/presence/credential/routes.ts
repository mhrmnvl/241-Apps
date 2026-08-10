import type { RouteRecordRaw } from 'vue-router'

export const credentialRoutes: RouteRecordRaw[] = [
  {
    path: '/presensi/kartu',
    name: 'PresenceCredentialList',
    component: () => import('./views/CredentialListView.vue'),
    meta: {
      title: 'Kartu Presensi',
      requiresAuth: true,
      requiredPermission: 'presence-credentials.read',
      breadcrumbs: [
        { title: 'Presensi', href: '#' },
        { title: 'Kartu', href: '/presensi/kartu' },
      ],
    },
  },
  {
    path: '/presensi/kartu/cetak',
    name: 'PresenceCardPrint',
    component: () => import('./views/CardPrintSheet.vue'),
    props: (route) => ({
      userIds: String(route.query.userIds ?? '')
        .split(',')
        .filter(Boolean),
    }),
    meta: {
      title: 'Cetak Kartu',
      requiresAuth: true,
      requiredPermission: 'presence-credentials.read',
      breadcrumbs: [
        { title: 'Presensi', href: '#' },
        { title: 'Kartu', href: '/presensi/kartu' },
        { title: 'Cetak', href: '#' },
      ],
    },
  },
]
