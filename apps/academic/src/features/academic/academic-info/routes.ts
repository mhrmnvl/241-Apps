import type { RouteRecordRaw } from 'vue-router'

export const academicInfoRoutes: RouteRecordRaw[] = [
  {
    path: '/academic/info',
    name: 'academic-info',
    component: () => import('./views/AcademicInfoView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'announcements.read',
      title: 'Informasi Akademik',
    },
  },
]
