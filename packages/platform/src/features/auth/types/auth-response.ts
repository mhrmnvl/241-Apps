import type { AuthUser } from './session'

export interface LoginResponse {
  accessToken: string
  user: AuthUser
}

/**
 * `GET /auth/me` — the session identity every app bootstraps from.
 *
 * Small on purpose. Display extras (avatar, email) are not here; they arrive
 * later from `/profiles/me` via `authService.syncAuthenticatedUserProfile`,
 * which the app shell calls once it has mounted.
 */
export interface SessionIdentity {
  id: string
  identifier: string
  isActive: boolean
  name: string | null
  roles: string[]
  permissions: string[]
}

export interface LogoutResponse {
  message: string
}

export interface RefreshTokenResponse {
  data?: { accessToken?: string }
  accessToken?: string
}
