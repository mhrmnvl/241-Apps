import type { RouteRecordRaw } from 'vue-router'

/**
 * Public reading routes, as children of the public shell (composed in the
 * router). Each carries `meta.postType`, which is what lets one list view and
 * one detail view serve every content type.
 *
 * `/berita/:slug` deliberately matches any slug. Whether the item exists, is a
 * draft, or was deleted is the API's answer, not the router's — resolving those
 * differently here would leak the distinction the 404 exists to hide.
 */
export const portalPublicPostRoutes: RouteRecordRaw[] = [
  {
    path: 'berita',
    name: 'public-berita',
    component: () => import('./views/PublicPostListView.vue'),
    meta: { postType: 'BERITA', title: 'Berita' },
  },
  {
    path: 'berita/:slug',
    name: 'public-berita-detail',
    component: () => import('./views/PublicPostDetailView.vue'),
    meta: { postType: 'BERITA', title: 'Berita' },
  },
  {
    path: 'artikel',
    name: 'public-artikel',
    component: () => import('./views/PublicPostListView.vue'),
    meta: { postType: 'ARTIKEL', title: 'Artikel' },
  },
  {
    path: 'artikel/:slug',
    name: 'public-artikel-detail',
    component: () => import('./views/PublicPostDetailView.vue'),
    meta: { postType: 'ARTIKEL', title: 'Artikel' },
  },
  {
    // Its own list view: announcements are scanned rather than browsed, so
    // they read as a dated list rather than a grid of cards.
    path: 'pengumuman',
    name: 'public-pengumuman',
    component: () => import('./views/PublicAnnouncementListView.vue'),
    meta: { postType: 'PENGUMUMAN', title: 'Pengumuman' },
  },
  {
    // The detail view is shared: an expired announcement stays reachable at
    // its own address, exactly like any other published item (FR-044).
    path: 'pengumuman/:slug',
    name: 'public-pengumuman-detail',
    component: () => import('./views/PublicPostDetailView.vue'),
    meta: { postType: 'PENGUMUMAN', title: 'Pengumuman' },
  },
]

/**
 * Management routes. Registered as children of the admin layout route, so they
 * keep their absolute paths while rendering inside the shell.
 *
 * `meta.postType` is what lets one list view and one form view serve all three
 * post types — they differ only in which type they filter and create.
 */
export const portalPostRoutes: RouteRecordRaw[] = [
  {
    path: '/admin/berita',
    name: 'admin-berita',
    component: () => import('./views/PostListView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'portal-posts.read',
      postType: 'BERITA',
      title: 'Berita',
      breadcrumbs: [{ title: 'Konten' }, { title: 'Berita' }],
    },
  },
  {
    path: '/admin/artikel',
    name: 'admin-artikel',
    component: () => import('./views/PostListView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'portal-posts.read',
      postType: 'ARTIKEL',
      title: 'Artikel',
      breadcrumbs: [{ title: 'Konten' }, { title: 'Artikel' }],
    },
  },
  {
    path: '/admin/pengumuman',
    name: 'admin-pengumuman',
    component: () => import('./views/PostListView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'portal-posts.read',
      postType: 'PENGUMUMAN',
      title: 'Pengumuman',
      breadcrumbs: [{ title: 'Konten' }, { title: 'Pengumuman' }],
    },
  },
  {
    path: '/admin/konten/baru/:type',
    name: 'admin-post-new',
    component: () => import('./views/PostFormView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'portal-posts.create',
      title: 'Tulis Konten',
      breadcrumbs: [{ title: 'Konten' }, { title: 'Tulis' }],
    },
  },
  {
    path: '/admin/konten/:id',
    name: 'admin-post-edit',
    component: () => import('./views/PostFormView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'portal-posts.update',
      title: 'Ubah Konten',
      breadcrumbs: [{ title: 'Konten' }, { title: 'Ubah' }],
    },
  },
  {
    path: '/admin/beranda',
    name: 'admin-homepage-settings',
    component: () =>
      import('@/features/homepage/views/HomepageSectionSettingsView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'portal-settings.read',
      title: 'Pengaturan Beranda',
      breadcrumbs: [{ title: 'Pengaturan Portal' }, { title: 'Beranda' }],
    },
  },
]
