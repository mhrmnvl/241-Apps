import type { RouteRecordRaw } from 'vue-router'

export const positionCategoryRoutes: RouteRecordRaw[] = [
  {
    path: '/setting/position-category',
    name: 'PositionCategoryList',
    component: () => import('./views/PositionCategoryListView.vue'),
    meta: {
      title: 'Kategori Jabatan',
      requiresAuth: true,
      requiredPermission: 'positions.read',
    },
  },
]
