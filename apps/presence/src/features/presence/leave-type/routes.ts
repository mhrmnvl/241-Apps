import type { RouteRecordRaw } from 'vue-router'

export const leaveTypeRoutes: RouteRecordRaw[] = [
  {
    path: '/presensi/jenis-izin',
    name: 'LeaveTypeList',
    component: () => import('./views/LeaveTypeView.vue'),
    meta: {
      title: 'Jenis Izin & Cuti',
      requiresAuth: true,
      requiredPermission: 'leave-types.read',
      breadcrumbs: [
        { title: 'Presensi', href: '#' },
        { title: 'Jenis Izin & Cuti', href: '/presensi/jenis-izin' },
      ],
    },
  },
]
