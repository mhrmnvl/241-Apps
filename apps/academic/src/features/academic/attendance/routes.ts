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
    // Legacy route kept for compatibility — redirects to the dedicated input page.
    path: '/academic/attendance',
    name: 'attendance',
    redirect: { name: 'attendance-input' },
  },
  {
    path: '/academic/attendance/input',
    name: 'attendance-input',
    component: () => import('./views/AttendanceInputView.vue'),
    meta: {
      requiresAuth: true,
      // The register is written here, not read — `attendances.manage`, matching
      // the menu entry. Gated on the read, the screen was reachable by URL for
      // anyone who may look at attendance.
      requiredPermission: 'attendances.manage',
      title: 'Input Kehadiran',
      breadcrumbs: [
        { title: 'Kehadiran', href: '#' },
        { title: 'Input Kehadiran', href: '/academic/attendance/input' },
      ],
    },
  },
  {
    path: '/academic/attendance/rekapitulasi',
    name: 'attendance-recap',
    component: () => import('./views/AttendanceRecapView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'attendances.read',
      title: 'Rekapitulasi Kehadiran',
      breadcrumbs: [
        { title: 'Kehadiran', href: '#' },
        { title: 'Rekapitulasi', href: '/academic/attendance/rekapitulasi' },
      ],
    },
  },
]
