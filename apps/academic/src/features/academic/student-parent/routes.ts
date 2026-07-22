import type { RouteRecordRaw } from 'vue-router'

export const studentParentRoutes: RouteRecordRaw[] = [
  {
    path: '/data-master/relasi-orang-tua',
    name: 'student-parent',
    component: () => import('./views/StudentParentView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'students.read',
      title: 'Relasi Siswa — Orang Tua',
    },
  },
]
