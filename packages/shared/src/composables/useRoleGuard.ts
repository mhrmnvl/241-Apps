import { useAuthStore } from '@/features/platform/auth'
import { computed } from 'vue'

export function useRoleGuard() {
  const authStore = useAuthStore()
  const userRoles = computed(() => authStore.user?.roles ?? [])
  const userPermissions = computed(() => authStore.user?.permissions ?? [])

  const isSuperAdmin = computed(() => userRoles.value.includes('SUPER_ADMIN'))

  const isAdmin = computed(
    () => isSuperAdmin.value || userPermissions.value.includes('users.read'),
  )

  const isTeacher = computed(
    () => isSuperAdmin.value || userPermissions.value.includes('teachers.read'),
  )

  const isStudent = computed(() => userRoles.value.includes('STUDENT'))

  const canManage = computed(() => isAdmin.value)
  const canContribute = computed(() => isAdmin.value || isTeacher.value)

  function hasRole(...roles: string[]): boolean {
    return userRoles.value.some((r: string) => roles.includes(r))
  }

  /**
   * Permission-based gate for buttons/actions. SUPER_ADMIN always passes.
   * Prefer this over role checks so custom roles work by the permissions they
   * hold (e.g. `hasPermission('students.create')`).
   */
  function hasPermission(...permissions: string[]): boolean {
    if (isSuperAdmin.value) return true
    return permissions.some((p) => userPermissions.value.includes(p))
  }

  return {
    userRoles,
    userPermissions,
    isSuperAdmin,
    isAdmin,
    isTeacher,
    isStudent,
    canManage,
    canContribute,
    hasRole,
    hasPermission,
  }
}
