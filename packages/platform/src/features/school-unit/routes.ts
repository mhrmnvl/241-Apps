import type { RouteRecordRaw } from 'vue-router'

export const schoolUnitRoutes: RouteRecordRaw[] = [
  {
    path: '/school-unit',
    name: 'school-unit',
    component: () => import('./views/SchoolUnitView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['ADMIN', 'TEACHER'],
      title: 'Kelembagaan',
    },
  },
  {
    path: '/school-unit/edit',
    name: 'school-unit-edit',
    component: () => import('./views/SchoolUnitEditView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['ADMIN'],
      title: 'Ubah Data Kelembagaan',
    },
  },
]
