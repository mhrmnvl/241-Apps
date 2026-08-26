import type { RouteRecordRaw } from 'vue-router'

export const classroomRoutes: RouteRecordRaw[] = [
  {
    // A student's own classroom, beside their own schedule and marks. Not
    // `/academic/classroom/:id` — there is no id, because there is no choice.
    path: '/academic/my/classroom',
    name: 'my-classroom',
    component: () => import('./views/MyClassroomView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'classrooms.read-own',
      title: 'Kelas Saya',
      breadcrumbs: [{ title: 'Kelas Saya' }],
    },
  },
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
