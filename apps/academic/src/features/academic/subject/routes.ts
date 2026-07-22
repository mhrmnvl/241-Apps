import type { RouteRecordRaw } from 'vue-router'

export const subjectRoutes: RouteRecordRaw[] = [
  {
    path: '/pembelajaran/mata-pelajaran',
    name: 'subject',
    component: () => import('./views/SubjectView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'subjects.read',
      title: 'Mata Pelajaran',
    },
  },
]
