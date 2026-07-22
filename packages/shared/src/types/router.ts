import 'vue-router'

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
    title?: string
  }
}
