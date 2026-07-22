import type { RouteRecordRaw } from 'vue-router'

export const schoolUnitRoutes: RouteRecordRaw[] = [
  {
    path: '/school-unit',
    name: 'school-unit',
    component: () => import('./views/SchoolUnitView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'school-units.read',
      title: 'Kelembagaan',
    },
  },
  {
    path: '/school-unit/edit',
    name: 'school-unit-edit',
    component: () => import('./views/SchoolUnitEditView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'school-units.read',
      title: 'Ubah Data Kelembagaan',
    },
  },
]
