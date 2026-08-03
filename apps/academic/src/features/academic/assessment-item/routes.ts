import type { RouteRecordRaw } from 'vue-router'

export const assessmentItemRoutes: RouteRecordRaw[] = [
  {
    path: '/academic/student-score',
    name: 'AssessmentItems',
    component: () => import('./views/AssessmentItemListView.vue'),
    meta: {
      title: 'Tugas & Nilai',
      requiresAuth: true,
      requiredPermission: 'assessment-items.read',
      breadcrumbs: [
        { title: 'Penilaian', href: '#' },
        { title: 'Tugas & Nilai', href: '/academic/student-score' },
      ],
    },
  },
]
