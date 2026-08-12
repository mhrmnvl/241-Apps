import type { RouteRecordRaw } from 'vue-router'

export const workPatternRoutes: RouteRecordRaw[] = [
  {
    path: '/presensi/pola-kerja',
    name: 'WorkPatternList',
    component: () => import('./views/WorkPatternListView.vue'),
    meta: {
      title: 'Pola Kerja',
      requiresAuth: true,
      requiredPermission: 'work-patterns.read',
      breadcrumbs: [
        { title: 'Presensi', href: '#' },
        { title: 'Pola Kerja', href: '/presensi/pola-kerja' },
      ],
    },
  },
  {
    path: '/presensi/penugasan-pola-kerja',
    name: 'WorkPatternAssignmentList',
    component: () => import('./views/WorkPatternAssignmentView.vue'),
    meta: {
      title: 'Penugasan Pola Kerja',
      requiresAuth: true,
      requiredPermission: 'work-patterns.read',
      breadcrumbs: [
        { title: 'Presensi', href: '#' },
        {
          title: 'Penugasan Pola Kerja',
          href: '/presensi/penugasan-pola-kerja',
        },
      ],
    },
  },
  {
    path: '/presensi/hari-libur',
    name: 'NonWorkingDayList',
    component: () => import('./views/NonWorkingDayListView.vue'),
    meta: {
      title: 'Hari Libur',
      requiresAuth: true,
      requiredPermission: 'non-working-days.read',
      breadcrumbs: [
        { title: 'Presensi', href: '#' },
        { title: 'Hari Libur', href: '/presensi/hari-libur' },
      ],
    },
  },
  {
    path: '/presensi/periode',
    name: 'AttendancePeriodList',
    component: () => import('./views/AttendancePeriodView.vue'),
    meta: {
      title: 'Periode Kehadiran',
      requiresAuth: true,
      requiredPermission: 'presence-records.read',
      breadcrumbs: [
        { title: 'Presensi', href: '#' },
        { title: 'Periode', href: '/presensi/periode' },
      ],
    },
  },
]
