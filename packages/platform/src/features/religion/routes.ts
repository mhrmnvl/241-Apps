import type { RouteRecordRaw } from 'vue-router'

export const religionRoutes: RouteRecordRaw[] = [
  {
    path: '/setting/religion',
    name: 'ReligionList',
    component: () => import('./views/ReligionListView.vue'),
    meta: {
      title: 'Agama',
      requiresAuth: true,
      requiredPermission: 'religions.read',
    },
  },
]
