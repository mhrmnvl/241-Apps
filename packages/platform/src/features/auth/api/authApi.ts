import api from '@/shared/utils/api'
import type { ApiEnvelope } from '@/shared/types/api'
import type {
  LoginPayload,
  LoginResponse,
  LogoutResponse,
  AuthChangePasswordPayload,
  ResetPasswordPayload,
  SessionIdentity,
} from '../types'

export const authApi = {
  login: (payload: LoginPayload) => {
    return api.post<ApiEnvelope<LoginResponse>>('/auth/login', payload)
  },

  /**
   * Who the bearer token belongs to, and what it may do.
   *
   * Deliberately not `/profiles/me`: that answers with the full biodata graph
   * (addresses, achievements, enrolments, the class supervisor's own profile),
   * which is the wrong weight for something every app loads before its router
   * can resolve a single route.
   */
  me: () => {
    return api.get<ApiEnvelope<SessionIdentity>>('/auth/me')
  },

  logout: () => {
    return api.post<ApiEnvelope<LogoutResponse>>('/auth/logout')
  },

  changePassword: (payload: AuthChangePasswordPayload) => {
    return api.post<ApiEnvelope<{ success: boolean; message: string }>>(
      '/auth/change-password',
      payload,
    )
  },

  forgotPassword: (payload: { identifier: string }) => {
    return api.post<ApiEnvelope<{ success: boolean; message: string }>>(
      '/auth/forgot-password',
      payload,
    )
  },

  resetPassword: (payload: ResetPasswordPayload) => {
    return api.post<ApiEnvelope<{ success: boolean; message: string }>>(
      '/auth/reset-password',
      payload,
    )
  },
}
