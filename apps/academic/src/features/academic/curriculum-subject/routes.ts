import type { RouteRecordRaw } from 'vue-router'

export const curriculumSubjectRoutes: RouteRecordRaw[] = [
  {
    path: '/academic/curriculum/:id/subject',
    name: 'curriculum-subject',
    component: () => import('./views/CurriculumSubjectView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'curriculum-subjects.read',
      title: 'Mata Pelajaran Kurikulum',
    },
  },
]
