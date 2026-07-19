import type { RouteRecordRaw } from 'vue-router'

export const organizationRoutes: RouteRecordRaw[] = [
  {
    path: '/organization',
    name: 'organization',
    component: () => import('./views/OrganizationView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['ADMIN', 'TEACHER'],
      title: 'Profil Yayasan',
    },
  },
  {
    path: '/organization/edit',
    name: 'organization-edit',
    component: () => import('./views/OrganizationEditView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['ADMIN'],
      title: 'Ubah Data Yayasan',
    },
  },
]
