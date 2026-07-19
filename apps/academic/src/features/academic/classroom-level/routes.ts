import type { RouteRecordRaw } from 'vue-router'

export const classroomLevelRoutes: RouteRecordRaw[] = [
  {
    path: '/akademik/tingkat-kelas',
    name: 'classroom-level',
    component: () => import('./views/ClassroomLevelView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['ADMIN', 'TEACHER'],
      title: 'Tingkat Kelas',
    },
  },
]
