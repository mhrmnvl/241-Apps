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
      breadcrumbs: [
        { title: 'Siswa', href: '/student' },
        { title: 'Daftar Siswa' },
      ],
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
      breadcrumbs: [
        { title: 'Siswa', href: '/student' },
        { title: 'Tambah Siswa' },
      ],
    },
  },

  {
    path: '/student/account',
    name: 'student-accounts',
    component: () => import('./views/StudentAccountsView.vue'),
    meta: {
      requiresAuth: true,
      // Accounts rather than people — the menu entry is gated the same way.
      requiredPermission: 'users.read',
      title: 'Akun Siswa',
      breadcrumbs: [
        { title: 'Siswa', href: '/student' },
        { title: 'Akun Siswa' },
      ],
    },
  },
]
