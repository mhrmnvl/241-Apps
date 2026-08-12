export { authConfig, configureAuth } from './config'
export { authApi } from './api/authApi'
export { accountApi } from './api/accountApi'
export { authService } from './services/authService'
export { authSessionService } from './services/authSessionService'
export { authIdentityService } from './services/authIdentityService'
export { authProfileService } from './services/authProfileService'
export { accountService } from './services/accountService'
export { useAuthStore } from './stores/authStore'
export { useAuthLogin } from './composables/useAuthLogin'
export { useAuthSession } from './composables/useAuthSession'
export { useRoleGuard } from './composables/useRoleGuard'
export { useLoginForm } from './composables/useLoginForm'
export { authRoutes } from './routes'
export { default as NotFoundView } from './views/NotFoundView.vue'
export type {
  AuthUser,
  AuthProfile,
  LoginResponse,
  LogoutResponse,
  RefreshTokenResponse,
  SessionIdentity,
  LoginPayload,
  ChangePasswordPayload,
  AuthChangePasswordPayload,
  ResetPasswordPayload,
  ProfileEnvelope,
  ExtractEnvelope,
} from './types'
