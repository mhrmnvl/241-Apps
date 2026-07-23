import type { RouteRecordRaw } from 'vue-router'

export const studentScoreRoutes: RouteRecordRaw[] = [
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
