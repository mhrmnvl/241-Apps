import type { RouteRecordRaw } from 'vue-router'

export const classroomRoutes: RouteRecordRaw[] = [
  {
    path: '/academic/classroom',
    name: 'classroom',
    component: () => import('./views/ClassroomView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'classrooms.read',
      title: 'Kelas',
      breadcrumbs: [
        { title: 'Akademik', href: '#' },
        { title: 'Kelas', href: '/academic/classroom' },
      ],
    },
  },
  {
    path: '/academic/classroom/:id/manage',
    name: 'classroom-manage',
    component: () => import('./views/ClassroomManageView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'classrooms.read',
      title: 'Kelola Kelas',
    },
  },
]
