import type { RouteRecordRaw } from 'vue-router'

/**
 * Both screens are the `@241/master-data` engine driven by a per-entity config
 * (ADR-0001) — the views are four lines each and hold no logic.
 */
export const portalTaxonomyRoutes: RouteRecordRaw[] = [
  {
    path: '/admin/kategori',
    name: 'admin-kategori',
    component: () => import('./views/CategoryListView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'portal-categories.read',
      title: 'Kategori',
      breadcrumbs: [{ title: 'Konten' }, { title: 'Kategori' }],
    },
  },
  {
    path: '/admin/tag',
    name: 'admin-tag',
    component: () => import('./views/TagListView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'portal-tags.read',
      title: 'Tag',
      breadcrumbs: [{ title: 'Konten' }, { title: 'Tag' }],
    },
  },
]
