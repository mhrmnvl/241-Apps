import type { RouteRecordRaw } from 'vue-router'

export const subjectRoutes: RouteRecordRaw[] = [
  {
    path: '/learning/subject',
    name: 'subject',
    component: () => import('./views/SubjectView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'subjects.read',
      title: 'Mata Pelajaran',
      breadcrumbs: [
        { title: 'Pembelajaran', href: '#' },
        { title: 'Mata Pelajaran', href: '/learning/subject' },
      ],
    },
  },
]
