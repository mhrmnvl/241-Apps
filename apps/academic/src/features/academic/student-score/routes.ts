import type { RouteRecordRaw } from 'vue-router'

export const studentScoreRoutes: RouteRecordRaw[] = [
  {
    path: '/academic/my/scores',
    name: 'my-scores',
    component: () => import('./views/MyScoreView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'student-scores.read-own',
      title: 'Nilai Saya',
      breadcrumbs: [{ title: 'Akademik Saya', href: '#' }, { title: 'Nilai' }],
    },
  },
  {
    path: '/academic/student-score/:assessmentItemId/grade',
    name: 'StudentScoreGrading',
    component: () => import('./views/StudentScoreGradingView.vue'),
    meta: {
      title: 'Nilai Siswa',
      requiresAuth: true,
      requiredPermission: 'student-scores.read',
    },
  },
]
