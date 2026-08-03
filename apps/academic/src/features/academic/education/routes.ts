import type { RouteRecordRaw } from 'vue-router'

export const educationRoutes: RouteRecordRaw[] = [
  {
    path: '/setting/education-level',
    name: 'EducationList',
    component: () => import('./views/EducationListView.vue'),
    meta: {
      title: 'Tingkat Pendidikan',
      requiresAuth: true,
      requiredPermission: 'educations.read',
      breadcrumbs: [
        { title: 'Pengaturan', href: '#' },
        { title: 'Tingkat Pendidikan', href: '/setting/education-level' },
      ],
    },
  },
]
