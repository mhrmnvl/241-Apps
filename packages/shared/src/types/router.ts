import 'vue-router'
import type { BreadcrumbItemType } from './breadcrumb.types'

export type UserRole = string

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    guestOnly?: boolean
    /**
     * Legacy role gate (still honored). Prefer `requiredPermission` so custom
     * roles are granted access by the permissions they hold, not their name.
     */
    allowedRoles?: UserRole[]
    /**
     * Permission gate: the user must hold this permission (SUPER_ADMIN always
     * passes). Checked by the router guard and mirrored by the sidebar.
     */
    requiredPermission?: string
    /**
     * Permission gate for a route two kinds of person reach two ways.
     *
     * The teaching-assignment screen is the case it exists for: whoever
     * assigns the teaching opens it with `teaching-assignments.read` and sees
     * the school's, and a teacher opens it with `.read-own` and sees theirs.
     * One string could only name one of them — the menu offered the entry and
     * the router then bounced the teacher to the dashboard, which reads as the
     * link being broken rather than as a refusal.
     *
     * `requiredPermission` wins where both are given. Mirrors
     * `MenuSection.requiredAnyPermission`.
     */
    requiredAnyPermission?: string[]
    title?: string
    /**
     * Breadcrumb trail for this route, rendered by the app shell.
     *
     * Static trails belong here. A view whose trail depends on data it fetches
     * cannot state it up front and should call `useBreadcrumbs()` instead, which
     * overrides this for as long as the view is mounted.
     */
    breadcrumbs?: BreadcrumbItemType[]
  }
}
