import type { RouteRecordRaw } from 'vue-router'

export const teachingAssignmentRoutes: RouteRecordRaw[] = [
  {
    path: '/learning/teaching-assignment',
    name: 'teaching-assignment',
    component: () => import('./views/TeachingAssignmentView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'teaching-assignments.read',
      title: 'Penugasan Mengajar',
    },
  },
]
