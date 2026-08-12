import type { RouteRecordRaw } from 'vue-router'

export const payslipRoutes: RouteRecordRaw[] = [
  {
    path: '/penggajian/slip-gaji-saya',
    name: 'MyPayslip',
    component: () => import('./views/MyPayslipView.vue'),
    meta: {
      title: 'Slip Gaji Saya',
      requiresAuth: true,
      requiredPermission: 'payroll-payslips.read-own',
      breadcrumbs: [
        { title: 'Penggajian', href: '#' },
        { title: 'Slip Gaji Saya', href: '/penggajian/slip-gaji-saya' },
      ],
    },
  },
  {
    path: '/penggajian/slip-gaji/:id',
    name: 'PayslipDetail',
    component: () => import('./views/PayslipDetailView.vue'),
    meta: {
      title: 'Slip Gaji',
      requiresAuth: true,
      requiredPermission: 'payroll-payslips.read',
      breadcrumbs: [
        { title: 'Penggajian', href: '#' },
        { title: 'Slip Gaji', href: '#' },
      ],
    },
  },
]
