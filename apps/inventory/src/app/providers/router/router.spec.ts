import { describe, it, expect } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { inventoryRoutes } from '@/features/inventory/routes'

const Stub = { render: () => null }
const Layout = { render: () => null }

/**
 * Mirrors the shape of the real router: the '/' redirect, then a layout route
 * that also answers to '/', with the inventory routes as absolute-path children.
 *
 * The real module cannot be imported here — it builds guards over Pinia stores
 * at import time — so this asserts the routing shape the module assembles, which
 * is the part a typechecker cannot see.
 */
function buildRouter() {
  const layoutRoute: RouteRecordRaw = {
    path: '/',
    component: Layout,
    children: [...inventoryRoutes],
  }
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', redirect: '/dashboard' },
      { path: '/dashboard', name: 'dashboard', component: Stub },
      layoutRoute,
      { path: '/:pathMatch(.*)*', name: 'not-found', component: Stub },
    ],
  })
}

describe('inventory route tree', () => {
  it('still redirects / to the dashboard even though the layout also owns /', () => {
    // resolve() reports the match rather than following the redirect, so the
    // check is that '/' lands on the redirect record and not on the layout —
    // matching the layout there would render an empty shell.
    const resolved = buildRouter().resolve('/')
    expect(resolved.matched).toHaveLength(1)
    expect(resolved.matched[0]?.redirect).toBe('/dashboard')
    expect(resolved.matched[0]?.components?.default).not.toBe(Layout)
  })

  it('renders shell routes through the layout without changing their URL', () => {
    const resolved = buildRouter().resolve('/inventory/assets')
    expect(resolved.name).toBe('inventory-assets')
    expect(resolved.matched).toHaveLength(2)
    expect(resolved.matched[0]?.components?.default).toBe(Layout)
  })

  it('keeps params working for nested absolute paths', () => {
    const resolved = buildRouter().resolve('/inventory/assets/42/edit')
    expect(resolved.name).toBe('inventory-assets-edit')
    expect(resolved.params.id).toBe('42')
    expect(resolved.matched).toHaveLength(2)
  })

  it('gives every shell route a breadcrumb trail', () => {
    for (const route of inventoryRoutes) {
      expect(
        route.meta?.breadcrumbs,
        `${String(route.name)} has no trail`,
      ).toBeDefined()
    }
  })
})
