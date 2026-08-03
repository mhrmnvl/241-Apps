import type { RouteRecordRaw } from 'vue-router'

export const teacherRoutes: RouteRecordRaw[] = [
  {
    path: '/teacher',
    name: 'teacher',
    component: () => import('./views/TeacherListView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'teachers.read',
      title: 'Daftar Guru',
      breadcrumbs: [{ title: 'Guru', href: '#' }, { title: 'Daftar Guru' }],
    },
  },
  {
    path: '/teacher/create',
    name: 'teacher-create',
    component: () => import('./views/TeacherCreateView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'teachers.read',
      title: 'Tambah Guru',
      breadcrumbs: [
        { title: 'Guru', href: '/teacher' },
        { title: 'Tambah Guru' },
      ],
    },
  },
  {
    path: '/teacher/account',
    name: 'teacher-accounts',
    component: () => import('./views/TeacherAccountView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'teachers.read',
      title: 'Akun Guru',
      breadcrumbs: [
        { title: 'Guru', href: '/teacher' },
        { title: 'Akun Guru' },
      ],
    },
  },
]
