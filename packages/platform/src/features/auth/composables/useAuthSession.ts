import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '../stores/authStore'
import { authService } from '../services/authService'
import { accountService } from '../services/accountService'

export function useAuthSession() {
  const store = useAuthStore()
  const { user } = storeToRefs(store)

  const isAuthenticated = computed(() => !!user.value)

  const roles = computed(() => user.value?.roles ?? [])

  const hasRole = (role: string) => roles.value.includes(role)

  const hasAnyRole = (...targetRoles: string[]) =>
    targetRoles.some((r) => roles.value.includes(r))

  const isStaff = computed(
    () => roles.value.length > 0 && !roles.value.every((r) => r === 'STUDENT'),
  )

  return {
    user,
    roles,
    isAuthenticated,
    isStaff,
    hasRole,
    hasAnyRole,
    logoutUser: authService.logoutUser,
    syncAuthenticatedUserProfile: authService.syncAuthenticatedUserProfile,
    changePassword: accountService.changePassword,
  }
}
