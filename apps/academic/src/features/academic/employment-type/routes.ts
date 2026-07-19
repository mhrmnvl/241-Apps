import type { RouteRecordRaw } from 'vue-router'

export const employmentTypeRoutes: RouteRecordRaw[] = [
  {
    path: '/pengaturan/status-kepegawaian',
    name: 'EmploymentTypeList',
    component: () => import('./views/EmploymentTypeListView.vue'),
    meta: {
      title: 'Status Kepegawaian',
      requiresAuth: true,
      allowedRoles: ['ADMIN'],
    },
  },
]
