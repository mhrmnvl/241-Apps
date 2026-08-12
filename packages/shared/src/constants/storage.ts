/**
 * Web-storage keys shared across every app.
 *
 * Declared here rather than in `@241/platform` because `@241/shared`'s axios
 * client reads the persisted user too (for the `x-school-unit-id` header) and
 * shared may not depend on platform. One constant, two readers.
 */

/**
 * The signed-in user's non-secret profile, roles, and permissions.
 *
 * `localStorage` is per-origin, so each app keeps its own copy — this is a
 * cache of the identity, never the session itself. The session is the HttpOnly
 * refresh cookie, which belongs to the API host and is therefore shared by all
 * apps; an app that finds this key empty re-derives it from that cookie rather
 * than asking the user to sign in again.
 *
 * Renamed from the app-specific `siakad_user` once presence-web made the name
 * wrong. Nothing migrates the old value: the cookie refills it on first load.
 */
export const AUTH_USER_STORAGE_KEY = '241_auth_user'
