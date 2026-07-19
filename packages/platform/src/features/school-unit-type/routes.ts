import type { RouteRecordRaw } from 'vue-router'

export const schoolUnitTypeRoutes: RouteRecordRaw[] = [
  {
    path: '/pengaturan/tipe-sekolah',
    name: 'SchoolUnitTypeList',
    component: () => import('./views/SchoolUnitTypeListView.vue'),
    meta: {
      title: 'Tipe Sekolah',
      requiresAuth: true,
      allowedRoles: ['SUPER_ADMIN', 'ADMIN'],
    },
  },
]
