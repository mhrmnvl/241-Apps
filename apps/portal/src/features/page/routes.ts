import type { RouteRecordRaw } from 'vue-router'

export const portalPageRoutes: RouteRecordRaw[] = [
  {
    path: '/admin/halaman',
    name: 'admin-halaman',
    component: () => import('./views/PageListView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'portal-pages.read',
      title: 'Halaman',
      breadcrumbs: [{ title: 'Konten' }, { title: 'Halaman' }],
    },
  },
  {
    path: '/admin/halaman/baru',
    name: 'admin-halaman-baru',
    component: () => import('./views/PageFormView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'portal-pages.create',
      title: 'Halaman Baru',
      breadcrumbs: [{ title: 'Konten' }, { title: 'Halaman Baru' }],
    },
  },
  {
    path: '/admin/halaman/:id',
    name: 'admin-halaman-edit',
    component: () => import('./views/PageFormView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'portal-pages.update',
      title: 'Ubah Halaman',
      breadcrumbs: [{ title: 'Konten' }, { title: 'Ubah Halaman' }],
    },
  },
  {
    path: '/admin/menu',
    name: 'admin-menu',
    component: () => import('./views/NavigationSettingsView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'portal-pages.read',
      title: 'Menu Portal',
      breadcrumbs: [{ title: 'Pengaturan Portal' }, { title: 'Menu' }],
    },
  },
]

/**
 * The public page catch-all.
 *
 * **Registered after every named public route**, because `/:pageSlug` matches
 * `/berita` just as happily as it matches `/profil`. Vue Router prefers the
 * more specific static path, but relying on that when the ordering is also
 * under our control would be trusting a subtlety for no reason.
 *
 * It deliberately does not exclude anything: whether an address belongs to a
 * page, a draft page, or nothing at all is the API's answer, and encoding a
 * guess here would leak which slugs exist.
 */
export const portalPublicPageRoutes: RouteRecordRaw[] = [
  {
    path: ':pageSlug',
    name: 'public-page',
    component: () => import('./views/PublicPageView.vue'),
    meta: { title: 'Portal MTs Persis 241 Al-Ikhlash' },
  },
]
