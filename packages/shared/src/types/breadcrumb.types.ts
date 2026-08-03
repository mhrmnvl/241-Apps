/**
 * One hop in a breadcrumb trail.
 *
 * Lives here rather than in an app layout because every app's `AppLayout`
 * accepts the same trail, and `@241/platform` describes the layout it expects
 * the host app to provide — four copies of this shape otherwise.
 */
export interface BreadcrumbItemType {
  title: string
  href?: string
}
