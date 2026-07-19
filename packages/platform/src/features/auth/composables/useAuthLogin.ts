import { authService } from '../services/authService'

export function useAuthLogin() {
  return {
    loginUser: authService.loginUser,
  }
}
