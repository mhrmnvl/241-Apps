import type { DefineComponent } from 'vue'
import type { BreadcrumbItemType } from '@/shared/types/breadcrumb.types'

/**
 * The layout contract this package expects its host app to satisfy.
 *
 * Down to a single consumer. Every other view in this package now renders
 * through a layout route and never names the shell, but `NotFoundView` shows
 * the shell only to signed-in visitors — a guest hitting an unknown URL gets a
 * bare page — and route matching cannot branch on that, so it keeps importing
 * `@/layouts/AppLayout.vue` and picking per render. Each app resolves that
 * specifier to its own layout through its own `@/*` alias.
 *
 * Standalone type-checking still has to resolve the import somehow. Aiming the
 * alias at a real app's layout (as it did, at `apps/academic`) makes a shared
 * package depend on one specific app and pulls that app's private imports into
 * this compilation. Declaring the shape instead keeps the dependency pointing
 * the right way: apps depend on the package, never the reverse.
 *
 * If `NotFoundView` ever stops needing a conditional shell, this file and the
 * `@/layouts/AppLayout.vue` entry in `tsconfig.json` can both go.
 *
 * Keep this in step with the apps' `AppLayout` props — nothing enforces it.
 */
declare module '@/layouts/AppLayout.vue' {
  const AppLayout: DefineComponent<{
    breadcrumbs?: BreadcrumbItemType[]
  }>
  export default AppLayout
}
