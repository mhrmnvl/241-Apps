import type { RouteRecordRaw } from 'vue-router'

export const attendanceRoutes: RouteRecordRaw[] = [
  {
    path: '/academic/attendance',
    name: 'attendance',
    component: () => import('./views/AttendanceView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'attendances.read',
      title: 'Kehadiran Siswa',
      breadcrumbs: [
        { title: 'Penilaian', href: '#' },
        { title: 'Kehadiran Siswa', href: '/academic/attendance' },
      ],
    },
  },
]
