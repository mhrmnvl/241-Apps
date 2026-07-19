import type { RouteRecordRaw } from 'vue-router'

export const curriculumSubjectRoutes: RouteRecordRaw[] = [
  {
    path: '/akademik/kurikulum/:id/mata-pelajaran',
    name: 'curriculum-subject',
    component: () => import('./views/CurriculumSubjectView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['ADMIN', 'TEACHER'],
      title: 'Mata Pelajaran Kurikulum',
    },
  },
]
