import type { RouteRecordRaw } from 'vue-router'

export const schoolUnitTypeRoutes: RouteRecordRaw[] = [
  {
    path: '/setting/school-unit-type',
    name: 'SchoolUnitTypeList',
    component: () => import('./views/SchoolUnitTypeListView.vue'),
    meta: {
      title: 'Tipe Sekolah',
      requiresAuth: true,
      requiredPermission: 'school-units.read',
      breadcrumbs: [
        { title: 'Pengaturan', href: '#' },
        { title: 'Tipe Sekolah', href: '/setting/school-unit-type' },
      ],
    },
  },
]
