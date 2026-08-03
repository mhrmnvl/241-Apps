import { describe, it, expect } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { classroomRoutes } from '@/features/academic/classroom'
import { scheduleRoutes } from '@/features/academic/schedule'
import { studentRoutes } from '@/features/academic/student'

const Stub = { render: () => null }
const Layout = { render: () => null }

/** The routes that publish their trail at runtime rather than stating it. */
const PUBLISHED_AT_RUNTIME = new Set([
  'classroom-manage',
  'schedule-view',
  'curriculum-subject',
  'classroom-schedule-editor',
  'StudentScoreGrading',
])

/**
 * Mirrors the shape of the real router: the '/' redirect, then a layout route
 * that also answers to '/', with the academic routes as absolute-path children.
 *
 * The real module cannot be imported here — it builds guards over Pinia stores
 * at import time — so this asserts the routing shape the module assembles, which
 * is the part a typechecker cannot see.
 */
function buildRouter(children: RouteRecordRaw[]) {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', redirect: '/dashboard' },
      { path: '/dashboard', name: 'dashboard', component: Stub },
      { path: '/', component: Layout, children },
      { path: '/:pathMatch(.*)*', name: 'not-found', component: Stub },
    ],
  })
}

describe('academic route tree', () => {
  it('still redirects / to the dashboard even though the layout also owns /', () => {
    // resolve() reports the match rather than following the redirect, so the
    // check is that '/' lands on the redirect record and not on the layout —
    // matching the layout there would render an empty shell.
    const resolved = buildRouter([...studentRoutes]).resolve('/')
    expect(resolved.matched).toHaveLength(1)
    expect(resolved.matched[0]?.redirect).toBe('/dashboard')
    expect(resolved.matched[0]?.components?.default).not.toBe(Layout)
  })

  it('renders shell routes through the layout without changing their URL', () => {
    const first = studentRoutes[0]
    expect(first).toBeDefined()
    const resolved = buildRouter([...studentRoutes]).resolve(first!.path)
    expect(resolved.matched).toHaveLength(2)
    expect(resolved.matched[0]?.components?.default).toBe(Layout)
  })

  it('keeps params working for nested absolute paths', () => {
    const resolved = buildRouter([...classroomRoutes]).resolve(
      '/academic/classroom/abc/manage',
    )
    expect(resolved.params.id).toBe('abc')
    expect(resolved.matched).toHaveLength(2)
  })

  it('states a trail on every route that does not publish one at runtime', () => {
    const all = [...studentRoutes, ...classroomRoutes, ...scheduleRoutes]
    for (const route of all) {
      const name = String(route.name)
      if (PUBLISHED_AT_RUNTIME.has(name)) {
        // Their trail depends on data the view fetches, so stating it in the
        // route would be a lie — useBreadcrumbs publishes it instead.
        expect(
          route.meta?.breadcrumbs,
          `${name} should not state a trail`,
        ).toBeUndefined()
      } else {
        expect(route.meta?.breadcrumbs, `${name} has no trail`).toBeDefined()
      }
    }
  })
})
