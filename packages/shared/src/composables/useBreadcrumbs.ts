import { inject, onScopeDispose, provide, ref, watchEffect } from 'vue'
import type { InjectionKey, Ref } from 'vue'
import type { BreadcrumbItemType } from '../types/breadcrumb.types'

type BreadcrumbOverride = Ref<BreadcrumbItemType[] | null>

const breadcrumbOverrideKey: InjectionKey<BreadcrumbOverride> =
  Symbol('breadcrumbOverride')

/**
 * Called once by the app shell. Returns the override ref it should render in
 * preference to `route.meta.breadcrumbs`.
 *
 * Most routes state a static trail in their `meta`, which needs no coordination.
 * This exists for the handful of views whose trail includes something they have
 * to fetch first — a classroom's name, a curriculum's title — which the route
 * cannot know up front.
 */
export function provideBreadcrumbs(): BreadcrumbOverride {
  const override: BreadcrumbOverride = ref(null)
  provide(breadcrumbOverrideKey, override)
  return override
}

/**
 * Called by a view whose trail depends on data it loads. Pass a getter; the
 * trail follows it and is dropped again when the view goes away, so the next
 * route falls back to its own `meta.breadcrumbs`.
 *
 * A view with a fixed trail should not use this — put the array in the route.
 */
export function useBreadcrumbs(
  getTrail: () => BreadcrumbItemType[] | null | undefined,
): void {
  const override = inject(breadcrumbOverrideKey, null)
  if (!override) {
    // Rendered outside the shell (a test harness, or a route deliberately
    // placed outside the layout). Nothing renders a trail, so nothing to set.
    return
  }

  let ours: BreadcrumbItemType[] | null = null

  watchEffect(() => {
    ours = getTrail() ?? null
    override.value = ours
  })

  onScopeDispose(() => {
    // Vue may mount the incoming view before unmounting the outgoing one, so a
    // blind reset here would wipe a trail the next view has already set. Only
    // clear what is still ours.
    if (override.value === ours) {
      override.value = null
    }
  })
}
