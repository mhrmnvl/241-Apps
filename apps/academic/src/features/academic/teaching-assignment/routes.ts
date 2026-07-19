import type { RouteRecordRaw } from 'vue-router'

export const teachingAssignmentRoutes: RouteRecordRaw[] = [
  {
    path: '/pembelajaran/penugasan-mengajar',
    name: 'teaching-assignment',
    component: () => import('./views/TeachingAssignmentView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['ADMIN', 'TEACHER'],
      title: 'Penugasan Mengajar',
    },
  },
]
