import type { RouteRecordRaw } from 'vue-router'

export const studentRoutes: RouteRecordRaw[] = [
  {
    path: '/students',
    name: 'students',
    component: () => import('./views/StudentListView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['ADMIN', 'TEACHER'],
      title: 'Daftar Siswa',
    },
  },

  {
    path: '/students/create',
    name: 'student-create',
    component: () => import('./views/StudentCreateView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['ADMIN'],
      title: 'Tambah Siswa',
    },
  },

  {
    path: '/students/accounts',
    name: 'student-accounts',
    component: () => import('./views/StudentAccountsView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['ADMIN', 'TEACHER'],
      title: 'Akun Siswa',
    },
  },
]
