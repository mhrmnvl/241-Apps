import type { RouteRecordRaw } from 'vue-router'

/**
 * Two entries under Data Akademik rather than one "Pengaturan Akademik" page.
 *
 * Nobody opens a settings page to change which day is a holiday — they look
 * for the holiday. The two things this record holds are unrelated to each
 * other and are reached for separately, so they are listed separately, beside
 * the other academic reference data.
 *
 * They remain one record on the server: both screens fetch it and both save it
 * whole, so the field a screen does not show passes through with its stored
 * value.
 */
export const academicSettingRoutes: RouteRecordRaw[] = [
  {
    path: '/setting/weekly-holiday',
    name: 'weekly-holiday',
    component: () => import('./views/WeeklyHolidayView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'academic-settings.read',
      title: 'Hari Libur Mingguan',
      breadcrumbs: [
        { title: 'Data Akademik', href: '#' },
        { title: 'Hari Libur Mingguan', href: '/setting/weekly-holiday' },
      ],
    },
  },
  {
    path: '/setting/passing-score',
    name: 'passing-score',
    component: () => import('./views/PassingScoreView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'academic-settings.read',
      title: 'Nilai Ketuntasan Minimum (KKM)',
      breadcrumbs: [
        { title: 'Data Akademik', href: '#' },
        {
          title: 'Nilai Ketuntasan Minimum (KKM)',
          href: '/setting/passing-score',
        },
      ],
    },
  },
]
