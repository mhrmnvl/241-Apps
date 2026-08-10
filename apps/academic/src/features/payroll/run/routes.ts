import type { RouteRecordRaw } from 'vue-router'

export const payrollRunRoutes: RouteRecordRaw[] = [
  {
    path: '/penggajian/run',
    name: 'PayrollRunList',
    component: () => import('./views/PayrollRunListView.vue'),
    meta: {
      title: 'Penggajian',
      requiresAuth: true,
      requiredPermission: 'payroll-runs.read',
      breadcrumbs: [
        { title: 'Penggajian', href: '#' },
        { title: 'Perhitungan', href: '/penggajian/run' },
      ],
    },
  },
  {
    path: '/penggajian/run/:id',
    name: 'PayrollRunDetail',
    component: () => import('./views/PayrollRunDetailView.vue'),
    meta: {
      title: 'Detail Penggajian',
      requiresAuth: true,
      requiredPermission: 'payroll-runs.read',
      breadcrumbs: [
        { title: 'Penggajian', href: '#' },
        { title: 'Perhitungan', href: '/penggajian/run' },
        { title: 'Detail', href: '#' },
      ],
    },
  },
]
