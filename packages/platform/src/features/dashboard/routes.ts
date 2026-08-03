import type { RouteRecordRaw } from 'vue-router'

export const dashboardRoutes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('./views/DashboardView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Dashboard',
      breadcrumbs: [{ title: 'Dashboard' }],
    },
  },
]
