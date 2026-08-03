import type { RouteRecordRaw } from 'vue-router'

export const studentParentRoutes: RouteRecordRaw[] = [
  {
    path: '/data/parent-relation',
    name: 'student-parent',
    component: () => import('./views/StudentParentView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'students.read',
      title: 'Relasi Siswa — Orang Tua',
      breadcrumbs: [
        { title: 'Data Master', href: '#' },
        { title: 'Relasi Orang Tua', href: '/data/parent-relation' },
      ],
    },
  },
]
