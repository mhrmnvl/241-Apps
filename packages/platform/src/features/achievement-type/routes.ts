import type { RouteRecordRaw } from 'vue-router'

export const achievementTypeRoutes: RouteRecordRaw[] = [
  {
    path: '/pengaturan/achievement-type',
    name: 'AchievementTypeList',
    component: () => import('./views/AchievementTypeListView.vue'),
    meta: {
      title: 'Tingkat Prestasi',
      requiresAuth: true,
      allowedRoles: ['ADMIN'],
    },
  },
]
