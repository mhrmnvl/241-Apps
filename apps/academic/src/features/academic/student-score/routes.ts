import type { RouteRecordRaw } from 'vue-router'

export const studentScoreRoutes: RouteRecordRaw[] = [
  {
    path: '/akademik/student-scores',
    name: 'StudentScores',
    component: () => import('./views/StudentScoreView.vue'),
    meta: {
      title: 'Nilai Siswa',
      requiresAuth: true,
      requiredPermission: 'student-scores.read',
    },
  },
]
