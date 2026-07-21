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
  const permissions = computed(() => user.value?.permissions ?? [])

  const hasRole = (role: string) => roles.value.includes(role)

  const hasAnyRole = (...targetRoles: string[]) =>
    targetRoles.some((r) => roles.value.includes(r))

  const hasPermission = (permission: string) =>
    permissions.value.includes(permission)

  const hasAnyPermission = (...perms: string[]) =>
    perms.some((p) => permissions.value.includes(p))

  const isStaff = computed(
    () => roles.value.length > 0 && !roles.value.every((r) => r === 'STUDENT'),
  )

  return {
    user,
    roles,
    permissions,
    isAuthenticated,
    isStaff,
    hasRole,
    hasAnyRole,
    hasPermission,
    hasAnyPermission,
    logoutUser: authService.logoutUser,
    syncAuthenticatedUserProfile: authService.syncAuthenticatedUserProfile,
    changePassword: accountService.changePassword,
  }
}
