import type { RouteRecordRaw } from 'vue-router'

export const teachingAssignmentRoutes: RouteRecordRaw[] = [
  {
    path: '/learning/teaching-assignment',
    name: 'teaching-assignment',
    component: () => import('./views/TeachingAssignmentView.vue'),
    meta: {
      requiresAuth: true,
      // Two ways in, as the menu entry says: the school's assignments for
      // whoever makes them, their own for a teacher. Gated on the wide read
      // alone, the entry appeared for a teacher and the router then sent them
      // to the dashboard.
      requiredAnyPermission: [
        'teaching-assignments.read',
        'teaching-assignments.read-own',
      ],
      title: 'Penugasan Mengajar',
      breadcrumbs: [
        { title: 'Pembelajaran', href: '#' },
        { title: 'Penugasan Mengajar', href: '/learning/teaching-assignment' },
      ],
    },
  },
]
