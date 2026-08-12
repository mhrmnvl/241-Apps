import type { RouteRecordRaw } from 'vue-router'

export const employeeAttendanceRoutes: RouteRecordRaw[] = [
  {
    path: '/presensi/kehadiran-pegawai',
    name: 'EmployeeAttendanceList',
    component: () => import('./views/EmployeeAttendanceView.vue'),
    meta: {
      title: 'Kehadiran Pegawai',
      requiresAuth: true,
      requiredPermission: 'presence-records.read',
      breadcrumbs: [
        { title: 'Presensi', href: '#' },
        { title: 'Kehadiran Pegawai', href: '/presensi/kehadiran-pegawai' },
      ],
    },
  },
  {
    path: '/presensi/rekap',
    name: 'PresenceMonthlyRecap',
    component: () => import('./views/MonthlyRecapView.vue'),
    meta: {
      title: 'Rekap Bulanan',
      requiresAuth: true,
      requiredPermission: 'presence-records.read',
      breadcrumbs: [
        { title: 'Presensi', href: '#' },
        { title: 'Rekap Bulanan', href: '/presensi/rekap' },
      ],
    },
  },
  {
    // Every staff member reaches this, so it is guarded by read-own rather than
    // the broader read (FR-061).
    path: '/presensi/kehadiran-saya',
    name: 'MyAttendance',
    component: () => import('./views/MyAttendanceView.vue'),
    meta: {
      title: 'Kehadiran Saya',
      requiresAuth: true,
      requiredPermission: 'presence-records.read-own',
      breadcrumbs: [
        { title: 'Presensi', href: '#' },
        { title: 'Kehadiran Saya', href: '/presensi/kehadiran-saya' },
      ],
    },
  },
]
