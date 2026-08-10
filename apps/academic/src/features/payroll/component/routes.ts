import type { RouteRecordRaw } from 'vue-router'

export const salaryComponentRoutes: RouteRecordRaw[] = [
  {
    path: '/penggajian/komponen',
    name: 'SalaryComponentList',
    component: () => import('./views/SalaryComponentView.vue'),
    meta: {
      title: 'Komponen Gaji',
      requiresAuth: true,
      requiredPermission: 'payroll-components.read',
      breadcrumbs: [
        { title: 'Penggajian', href: '#' },
        { title: 'Komponen Gaji', href: '/penggajian/komponen' },
      ],
    },
  },
]
