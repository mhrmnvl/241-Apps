import type { RouteRecordRaw } from 'vue-router'

export const assessmentItemRoutes: RouteRecordRaw[] = [
  {
    path: '/academic/student-score',
    name: 'AssessmentItems',
    component: () => import('./views/AssessmentItemListView.vue'),
    meta: {
      title: 'Tugas',
      requiresAuth: true,
      requiredPermission: 'assessment-items.read',
      breadcrumbs: [
        { title: 'Penilaian', href: '#' },
        { title: 'Tugas', href: '/academic/student-score' },
      ],
    },
  },
  {
    path: '/academic/assessment/penilaian',
    name: 'AssessmentGrading',
    component: () => import('./views/AssessmentGradingListView.vue'),
    meta: {
      title: 'Penilaian',
      requiresAuth: true,
      requiredPermission: 'student-scores.read',
      breadcrumbs: [
        { title: 'Penilaian', href: '#' },
        { title: 'Penilaian', href: '/academic/assessment/penilaian' },
      ],
    },
  },
]
