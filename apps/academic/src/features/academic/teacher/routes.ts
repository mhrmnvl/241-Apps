import type { RouteRecordRaw } from 'vue-router'

export const teacherRoutes: RouteRecordRaw[] = [
  {
    path: '/teacher',
    name: 'teacher',
    component: () => import('./views/TeacherListView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['ADMIN', 'TEACHER'],
      title: 'Daftar Guru',
    },
  },
  {
    path: '/teacher/accounts',
    name: 'teacher-accounts',
    component: () => import('./views/TeacherAccountView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['ADMIN', 'TEACHER'],
      title: 'Akun Guru',
    },
  },
]
