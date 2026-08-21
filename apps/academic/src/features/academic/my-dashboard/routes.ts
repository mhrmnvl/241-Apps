import type { RouteRecordRaw } from 'vue-router'

/**
 * `/dashboard` keeps its path and its name.
 *
 * Every permission denial in the router falls back to `{ name: 'dashboard' }`,
 * so this route has to stay reachable by everyone signed in and must carry no
 * `requiredPermission` of its own — a gate here would bounce a caller to the
 * route that just rejected them. What each person sees is decided inside the
 * view, from their own records.
 */
export const myDashboardRoutes: RouteRecordRaw[] = [
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('./views/MyDashboardView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Dashboard',
      breadcrumbs: [{ title: 'Dashboard' }],
    },
  },
]
