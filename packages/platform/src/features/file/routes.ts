import type { RouteRecordRaw } from 'vue-router'

export const fileRoutes: RouteRecordRaw[] = [
  {
    path: '/files',
    name: 'files',
    component: () => import('./views/FilesView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'files.read',
      title: 'Arsip Berkas',
    },
  },
]
