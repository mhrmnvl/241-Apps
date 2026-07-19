import 'vue-router'

export type UserRole = string

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    guestOnly?: boolean
    allowedRoles?: UserRole[]
    title?: string
  }
}
