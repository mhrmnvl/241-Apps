import type { RouteRecordRaw } from 'vue-router'

export const attendanceRoutes: RouteRecordRaw[] = [
  {
    path: '/akademik/kehadiran',
    name: 'attendance',
    component: () => import('./views/AttendanceView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'attendances.read',
      title: 'Kehadiran Siswa',
    },
  },
]
