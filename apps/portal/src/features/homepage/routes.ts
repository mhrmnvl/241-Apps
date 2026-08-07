import type { RouteRecordRaw } from 'vue-router'

/**
 * The homepage, as a child of the public shell.
 *
 * The shell itself is composed in the router rather than here: `/berita` and
 * `/artikel` belong to the post feature and share the same layout, and a
 * wrapper owned by one feature would have to import another feature's routes to
 * nest them. The app owns the shell; each feature owns its own pages.
 *
 * Nothing here carries `requiresAuth` — an anonymous visitor must reach these
 * without a session lookup.
 */
export const portalHomeRoutes: RouteRecordRaw[] = [
  {
    path: '',
    name: 'portal-home',
    component: () => import('./views/HomeView.vue'),
    meta: { title: 'Portal MTs Persis 241 Al-Ikhlash' },
  },
]
