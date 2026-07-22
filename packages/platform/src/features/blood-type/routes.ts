import type { RouteRecordRaw } from 'vue-router'

export const bloodTypeRoutes: RouteRecordRaw[] = [
  {
    path: '/pengaturan/blood-type',
    name: 'BloodTypeList',
    component: () => import('./views/BloodTypeListView.vue'),
    meta: {
      title: 'Golongan Darah',
      requiresAuth: true,
      requiredPermission: 'blood-types.read',
    },
  },
]
