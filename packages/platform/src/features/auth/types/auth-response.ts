import type { AuthUser } from './session'

export interface LoginResponse {
  accessToken: string
  user: AuthUser
}

export interface LogoutResponse {
  message: string
}

export interface RefreshTokenResponse {
  data?: { accessToken?: string }
  accessToken?: string
}
