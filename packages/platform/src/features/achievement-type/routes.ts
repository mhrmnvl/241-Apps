import type { RouteRecordRaw } from 'vue-router'

export const achievementTypeRoutes: RouteRecordRaw[] = [
  {
    path: '/setting/achievement-type',
    name: 'AchievementTypeList',
    component: () => import('./views/AchievementTypeListView.vue'),
    meta: {
      title: 'Tingkat Prestasi',
      requiresAuth: true,
      requiredPermission: 'achievement-types.read',
    },
  },
]
