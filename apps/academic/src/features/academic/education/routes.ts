import type { RouteRecordRaw } from 'vue-router'

export const educationRoutes: RouteRecordRaw[] = [
  {
    path: '/pengaturan/tingkat-pendidikan',
    name: 'EducationList',
    component: () => import('./views/EducationListView.vue'),
    meta: {
      title: 'Tingkat Pendidikan',
      requiresAuth: true,
      requiredPermission: 'educations.read',
    },
  },
]
