import api from '@/shared/utils/api'
import type { ApiEnvelope } from '@/shared/types/api'
import type {
  LoginPayload,
  LoginResponse,
  LogoutResponse,
  AuthChangePasswordPayload,
  ResetPasswordPayload,
} from '../types'

export const authApi = {
  login: (payload: LoginPayload) => {
    return api.post<ApiEnvelope<LoginResponse>>('/auth/login', payload)
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
