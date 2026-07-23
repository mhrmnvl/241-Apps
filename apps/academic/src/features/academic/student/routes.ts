import type { RouteRecordRaw } from 'vue-router'

export const studentRoutes: RouteRecordRaw[] = [
  {
    path: '/student',
    name: 'students',
    component: () => import('./views/StudentListView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'students.read',
      title: 'Daftar Siswa',
    },
  },

  {
    path: '/student/create',
    name: 'student-create',
    component: () => import('./views/StudentCreateView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'students.read',
      title: 'Tambah Siswa',
    },
  },

  {
    path: '/student/account',
    name: 'student-accounts',
    component: () => import('./views/StudentAccountsView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'students.read',
      title: 'Akun Siswa',
    },
  },
]
