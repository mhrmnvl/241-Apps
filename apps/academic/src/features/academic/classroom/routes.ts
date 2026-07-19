import type { RouteRecordRaw } from 'vue-router'

export const classroomRoutes: RouteRecordRaw[] = [
  {
    path: '/akademik/kelas',
    name: 'classroom',
    component: () => import('./views/ClassroomView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['ADMIN', 'TEACHER'],
      title: 'Kelas',
    },
  },
  {
    path: '/akademik/kelas/:id/kelola',
    name: 'classroom-manage',
    component: () => import('./views/ClassroomManageView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['ADMIN'],
      title: 'Kelola Kelas',
    },
  },
]
