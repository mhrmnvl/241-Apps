import type { RouteRecordRaw } from 'vue-router'

export const curriculumRoutes: RouteRecordRaw[] = [
  {
    path: '/academic/curriculum',
    name: 'curricula',
    component: () => import('./views/CurriculumView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'curricula.read',
      title: 'Kurikulum',
      breadcrumbs: [
        { title: 'Akademik', href: '#' },
        { title: 'Kurikulum', href: '/academic/curriculum' },
      ],
    },
  },
]
