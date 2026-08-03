import type { RouteRecordRaw } from 'vue-router'

export const organizationRoutes: RouteRecordRaw[] = [
  {
    path: '/organization',
    name: 'organization',
    component: () => import('./views/OrganizationView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'school-units.read',
      title: 'Profil Yayasan',
      breadcrumbs: [{ title: 'Profil Yayasan', href: '/organization' }],
    },
  },
  {
    path: '/organization/edit',
    name: 'organization-edit',
    component: () => import('./views/OrganizationEditView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'school-units.update',
      title: 'Ubah Data Yayasan',
      breadcrumbs: [
        { title: 'Profil Yayasan', href: '/organization' },
        { title: 'Ubah Data', href: '/organization/edit' },
      ],
    },
  },
]
