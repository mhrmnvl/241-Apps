import { describe, it, expect } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { admissionPublicRoutes, admissionRoutes } from '@/features/admission'

const Stub = { render: () => null }
const Layout = { render: () => null }

/**
 * Mirrors the shape of the real router: shell-less pages, then a layout route
 * that also answers to '/', with the admission routes as absolute-path children.
 *
 * The real module cannot be imported here — it builds guards over Pinia stores
 * at import time — so this asserts the routing shape the module assembles, which
 * is the part a typechecker cannot see.
 */
function buildRouter() {
  const layoutRoute: RouteRecordRaw = {
    path: '/',
    component: Layout,
    children: [...admissionRoutes],
  }
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      ...admissionPublicRoutes,
      layoutRoute,
      { path: '/:pathMatch(.*)*', name: 'not-found', component: Stub },
    ],
  })
}

describe('admission route tree', () => {
  it('keeps the landing page out of the shell even though the layout also owns /', () => {
    const resolved = buildRouter().resolve('/')
    expect(resolved.name).toBe('landing')
    expect(resolved.matched).toHaveLength(1)
  })

  it('renders shell routes through the layout without changing their URL', () => {
    const resolved = buildRouter().resolve('/pendaftaran')
    expect(resolved.name).toBe('applicant-dashboard')
    expect(resolved.matched).toHaveLength(2)
    expect(resolved.matched[0]?.components?.default).toBe(Layout)
  })

  it('keeps params working for nested absolute paths', () => {
    const resolved = buildRouter().resolve('/admin/pendaftar/7')
    expect(resolved.name).toBe('admin-application-detail')
    expect(resolved.params.id).toBe('7')
    expect(resolved.matched).toHaveLength(2)
  })

  it('gives every shell route a breadcrumb trail', () => {
    for (const route of admissionRoutes) {
      expect(
        route.meta?.breadcrumbs,
        `${String(route.name)} has no trail`,
      ).toBeDefined()
    }
  })
})
