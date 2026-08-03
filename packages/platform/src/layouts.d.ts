import type { DefineComponent } from 'vue'
import type { BreadcrumbItemType } from '@/shared/types/breadcrumb.types'

/**
 * The layout contract this package expects its host app to satisfy.
 *
 * Views in `@241/platform` import `@/layouts/AppLayout.vue`, which each app
 * resolves to its own layout through its own `@/*` alias — that is the seam
 * letting one set of shared views render inside three differently-branded
 * shells. This package therefore owns no such file.
 *
 * Standalone type-checking still has to resolve the import somehow. Aiming the
 * `@/layouts/*` alias at a real app's layout (as it did, at `apps/academic`)
 * makes a shared package depend on one specific app and pulls that app's
 * private imports into this compilation. Declaring the shape instead keeps the
 * dependency pointing the right way: apps depend on the package, never the
 * reverse.
 *
 * Keep this in step with the apps' `AppLayout` props — nothing enforces it.
 */
declare module '@/layouts/AppLayout.vue' {
  const AppLayout: DefineComponent<{
    breadcrumbs?: BreadcrumbItemType[]
  }>
  export default AppLayout
}
