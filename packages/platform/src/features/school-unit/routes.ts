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
      breadcrumbs: [{ title: 'Profil Sekolah', href: '/school-unit' }],
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
      breadcrumbs: [
        { title: 'Profil Sekolah', href: '/school-unit' },
        { title: 'Ubah Profil', href: '/school-unit/edit' },
      ],
    },
  },
]
