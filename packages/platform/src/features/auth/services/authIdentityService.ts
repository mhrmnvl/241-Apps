import { authApi } from '../api/authApi'
import type { AuthUser, SessionIdentity } from '../types'

/**
 * Turns `GET /auth/me` into the shape the stores and route guards read.
 *
 * `profile` is deliberately left unset rather than filled with nulls: the app
 * shell calls `syncAuthenticatedUserProfile` once mounted, and an explicit
 * `{ avatar: null }` here would briefly overwrite an avatar that call had
 * already resolved. Absent means "not loaded yet"; null would mean "none".
 */
function toAuthUser(identity: SessionIdentity): AuthUser {
  return {
    id: identity.id,
    identifier: identity.identifier,
    isActive: identity.isActive,
    roles: identity.roles ?? [],
    permissions: identity.permissions ?? [],
    name: identity.name,
  }
}

export const authIdentityService = {
  /**
   * The single way this workspace answers "who is signed in".
   *
   * Both entry points use it — signing in, and restoring a session another app
   * already opened — so the two can never disagree about a user's permissions.
   * Throws if the call fails; callers decide whether that means "signed out".
   */
  fetchIdentity: async (): Promise<AuthUser> => {
    const res = await authApi.me()
    const identity = res.data?.data
    if (!identity?.id) {
      throw new Error('No identity in /auth/me response')
    }
    return toAuthUser(identity)
  },
}
