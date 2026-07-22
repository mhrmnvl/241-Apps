import type { RouteRecordRaw } from 'vue-router'

export const positionCategoryRoutes: RouteRecordRaw[] = [
  {
    path: '/pengaturan/kategori-jabatan',
    name: 'PositionCategoryList',
    component: () => import('./views/PositionCategoryListView.vue'),
    meta: {
      title: 'Kategori Jabatan',
      requiresAuth: true,
      requiredPermission: 'positions.read',
    },
  },
]
