export interface LoginPayload {
  identifier: string
  password: string
}

export interface ChangePasswordPayload {
  password: string
}

export interface AuthChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export interface ResetPasswordPayload {
  token: string
  newPassword: string
}
