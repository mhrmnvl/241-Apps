import type { RouteRecordRaw } from 'vue-router'

export const leaveRoutes: RouteRecordRaw[] = [
  {
    // Every staff member reaches this, so it is guarded by read-own.
    path: '/presensi/izin-saya',
    name: 'MyLeave',
    component: () => import('./views/MyLeaveView.vue'),
    meta: {
      title: 'Izin & Cuti Saya',
      requiresAuth: true,
      requiredPermission: 'leave-requests.read-own',
      breadcrumbs: [
        { title: 'Presensi', href: '#' },
        { title: 'Izin & Cuti Saya', href: '/presensi/izin-saya' },
      ],
    },
  },
  {
    path: '/presensi/persetujuan-izin',
    name: 'LeaveApproval',
    component: () => import('./views/LeaveApprovalView.vue'),
    meta: {
      title: 'Persetujuan Izin',
      requiresAuth: true,
      requiredPermission: 'leave-requests.approve',
      breadcrumbs: [
        { title: 'Presensi', href: '#' },
        { title: 'Persetujuan Izin', href: '/presensi/persetujuan-izin' },
      ],
    },
  },
]
