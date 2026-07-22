import type { RouteRecordRaw } from 'vue-router'

export const studentScoreRoutes: RouteRecordRaw[] = [
  {
    path: '/akademik/student-scores/:assessmentItemId/nilai',
    name: 'StudentScoreGrading',
    component: () => import('./views/StudentScoreGradingView.vue'),
    meta: {
      title: 'Nilai Siswa',
      requiresAuth: true,
      requiredPermission: 'student-scores.read',
    },
  },
]
