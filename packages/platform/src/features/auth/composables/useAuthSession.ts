import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/authStore'
import { authService } from '../services/authService'
import { accountService } from '../services/accountService'

export function useAuthSession() {
  const store = useAuthStore()
  const { user } = storeToRefs(store)

  return {
    user,
    logoutUser: authService.logoutUser,
    syncAuthenticatedUserProfile: authService.syncAuthenticatedUserProfile,
    changePassword: accountService.changePassword,
  }
}
