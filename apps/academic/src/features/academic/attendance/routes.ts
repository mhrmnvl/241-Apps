import type { RouteRecordRaw } from 'vue-router'

export const attendanceRoutes: RouteRecordRaw[] = [
  {
    path: '/academic/my/attendance',
    name: 'my-attendance',
    component: () => import('./views/MyAttendanceView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'attendances.read-own',
      title: 'Kehadiran Saya',
      breadcrumbs: [
        { title: 'Akademik Saya', href: '#' },
        { title: 'Kehadiran' },
      ],
    },
  },
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
