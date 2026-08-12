import type { RouteRecordRaw } from 'vue-router'

export const salaryAssignmentRoutes: RouteRecordRaw[] = [
  {
    path: '/penggajian/gaji-pegawai',
    name: 'SalaryAssignmentList',
    component: () => import('./views/SalaryAssignmentView.vue'),
    meta: {
      title: 'Gaji Pegawai',
      requiresAuth: true,
      requiredPermission: 'payroll-salaries.read',
      breadcrumbs: [
        { title: 'Penggajian', href: '#' },
        { title: 'Gaji Pegawai', href: '/penggajian/gaji-pegawai' },
      ],
    },
  },
]
