import type { RouteRecordRaw } from 'vue-router'

export const studentParentRoutes: RouteRecordRaw[] = [
  {
    path: '/data/parent-relation',
    name: 'student-parent',
    component: () => import('./views/StudentParentView.vue'),
    meta: {
      requiresAuth: true,
      // The screen exists to tie a guardian to a child and untie them again;
      // somebody who cannot do either has nothing to do here.
      requiredPermission: 'students.update',
      title: 'Relasi Siswa — Orang Tua',
      breadcrumbs: [
        { title: 'Data Master', href: '#' },
        { title: 'Relasi Orang Tua', href: '/data/parent-relation' },
      ],
    },
  },
]
