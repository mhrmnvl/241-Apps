import type { RouteRecordRaw } from 'vue-router'

export const portalGalleryRoutes: RouteRecordRaw[] = [
  {
    path: '/admin/galeri',
    name: 'admin-galeri',
    component: () => import('./views/AlbumListView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'portal-albums.read',
      title: 'Galeri',
      breadcrumbs: [{ title: 'Konten' }, { title: 'Galeri' }],
    },
  },
  {
    path: '/admin/galeri/baru',
    name: 'admin-album-baru',
    component: () => import('./views/AlbumFormView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'portal-albums.create',
      title: 'Album Baru',
      breadcrumbs: [{ title: 'Konten' }, { title: 'Album Baru' }],
    },
  },
  {
    path: '/admin/galeri/:id',
    name: 'admin-album-edit',
    component: () => import('./views/AlbumFormView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'portal-albums.update',
      title: 'Ubah Album',
      breadcrumbs: [{ title: 'Konten' }, { title: 'Ubah Album' }],
    },
  },
]

/** Public routes, as children of the public shell (composed in the router). */
export const portalPublicGalleryRoutes: RouteRecordRaw[] = [
  {
    path: 'galeri',
    name: 'public-galeri',
    component: () => import('./views/PublicAlbumListView.vue'),
    meta: { title: 'Galeri' },
  },
  {
    path: 'galeri/:slug',
    name: 'public-galeri-detail',
    component: () => import('./views/PublicAlbumDetailView.vue'),
    meta: { title: 'Galeri' },
  },
]
