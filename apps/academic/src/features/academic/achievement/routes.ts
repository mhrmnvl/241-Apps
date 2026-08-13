import type { RouteRecordRaw } from 'vue-router'

export const achievementRoutes: RouteRecordRaw[] = [
  {
    path: '/achievement',
    name: 'achievement',
    component: () => import('./views/AchievementView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'achievements.read',
      title: 'Prestasi Siswa',
      breadcrumbs: [{ title: 'Prestasi Siswa', href: '/achievement' }],
    },
  },
]
