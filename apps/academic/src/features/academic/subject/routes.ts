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
  {
    path: '/learning/my-subject',
    name: 'my-subject',
    component: () => import('./views/MySubjectView.vue'),
    meta: {
      requiresAuth: true,
      // `classrooms.read-own`, not `teaching-assignments.read-own`: this is a
      // student's class read, and `.read-own` on teaching assignments means
      // "the classes I teach" — which no student holds, so the route bounced
      // every one of them to the dashboard.
      requiredPermission: 'classrooms.read-own',
      title: 'Mata Pelajaran Saya',
      // Akademik Saya, where the menu entry lives — not Pembelajaran, which is
      // the management group this screen deliberately is not part of. The last
      // crumb is the page, so it carries no link back to itself.
      breadcrumbs: [
        { title: 'Akademik Saya', href: '#' },
        { title: 'Mata Pelajaran Saya' },
      ],
    },
  },
]
