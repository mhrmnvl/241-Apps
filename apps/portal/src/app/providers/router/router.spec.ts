import { describe, it, expect } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { portalHomeRoutes } from '@/features/homepage'
import { portalPublicPageRoutes } from '@/features/page'
import { portalPublicPostRoutes } from '@/features/post'

const Stub = { render: () => null }
const AdminLayout = { render: () => null }
const PublicLayout = { render: () => null }

// Order mirrors the real router: the page catch-all is registered last.
const publicChildren = [
  ...portalHomeRoutes,
  ...portalPublicPostRoutes,
  ...portalPublicPageRoutes,
]

/**
 * Mirrors the shape of the real router: a public shell, then a layout route
 * that ALSO answers to '/', with admin routes as absolute-path children.
 *
 * The real module cannot be imported here — it builds guards over Pinia stores
 * at import time — so this asserts the routing shape the module assembles,
 * which is the part a typechecker cannot see.
 */
function buildRouter(adminChildren: RouteRecordRaw[] = []) {
  const publicRoute: RouteRecordRaw = {
    path: '/',
    component: PublicLayout,
    children: publicChildren,
  }
  const layoutRoute: RouteRecordRaw = {
    path: '/',
    component: AdminLayout,
    children: adminChildren,
  }
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      publicRoute,
      layoutRoute,
      { path: '/:pathMatch(.*)*', name: 'not-found', component: Stub },
    ],
  })
}

describe('portal route tree', () => {
  // The ordering trap: both the public tree and the admin layout claim '/'.
  // Registering the layout first would silently wrap the school's public
  // homepage in the staff shell, which an anonymous visitor must never see.
  it('resolves the homepage outside the admin shell even though both own /', () => {
    const resolved = buildRouter().resolve('/')

    expect(resolved.name).toBe('portal-home')
    expect(
      resolved.matched.some(
        (record) => record.components?.default === AdminLayout,
      ),
    ).toBe(false)
  })

  it('renders the homepage through the public layout', () => {
    const resolved = buildRouter().resolve('/')

    // PublicLayout wrapping HomeView — two records, neither of them the shell.
    expect(resolved.matched).toHaveLength(2)
    expect(resolved.matched[0]?.components?.default).toBe(PublicLayout)
  })

  it('routes the public listings and detail pages through the public layout', () => {
    const router = buildRouter()

    for (const path of ['/berita', '/berita/juara-1', '/artikel']) {
      const resolved = router.resolve(path)
      expect(resolved.matched[0]?.components?.default, path).toBe(PublicLayout)
      expect(resolved.name, path).not.toBe('not-found')
    }
  })

  it('still routes admin paths through the shell', () => {
    const resolved = buildRouter([
      { path: '/admin/berita', name: 'admin-posts', component: Stub },
    ]).resolve('/admin/berita')

    expect(resolved.name).toBe('admin-posts')
    expect(resolved.matched[0]?.components?.default).toBe(AdminLayout)
  })

  // A draft's address must be indistinguishable from one that never existed —
  // so '/berita/:slug' deliberately matches ANY slug and lets the API answer.
  // The router cannot tell them apart, which is the point; the 404 for an
  // unpublished item comes from the detail view, not from route resolution.
  it('matches an unpublished slug the same way it matches a published one', () => {
    const router = buildRouter()

    expect(router.resolve('/berita/belum-terbit').name).toBe(
      router.resolve('/berita/sudah-terbit').name,
    )
  })

  it('falls through to not-found for an address no route claims', () => {
    expect(buildRouter().resolve('/tidak-ada-sama-sekali/apa-pun').name).toBe(
      'not-found',
    )
  })

  /**
   * The page catch-all matches `/berita` as happily as `/profil`, so the named
   * listings must win. Vue Router prefers the more specific static path, but the
   * registration order is under our control and relying on the subtlety would be
   * trusting it for no reason.
   */
  it('does not let the page catch-all swallow a named listing', () => {
    const router = buildRouter()

    expect(router.resolve('/berita').name).toBe('public-berita')
    expect(router.resolve('/artikel').name).toBe('public-artikel')
  })

  it('routes an unclaimed single-segment address to the page view', () => {
    // Whether "/profil" is a real page, a draft, or nothing at all is the API's
    // answer — encoding a guess in the router would leak which slugs exist.
    expect(buildRouter().resolve('/profil').name).toBe('public-page')
  })

  it('leaves every public route open to anonymous visitors', () => {
    const requiresAuth = (route: RouteRecordRaw): boolean =>
      Boolean(route.meta?.requiresAuth) ||
      (route.children ?? []).some(requiresAuth)

    for (const route of publicChildren) {
      expect(requiresAuth(route), `${route.path} is gated`).toBe(false)
    }
  })
})
