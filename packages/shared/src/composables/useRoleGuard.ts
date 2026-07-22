import { useAuthStore } from '@/features/platform/auth'
import { computed } from 'vue'

/**
 * Permission-based authorization (CASL-style) — the only gate consumers
 * should use. There is deliberately no isAdmin/isTeacher/isStudent here:
 * a role name says who the user *is*, not what they're allowed to do, and
 * custom roles (assigned arbitrary permission sets) would silently fail
 * any role-name check. Every access decision is "does this user hold the
 * permission for this action", never "is this user an admin/teacher".
 */
export function useRoleGuard() {
  const authStore = useAuthStore()
  const userRoles = computed(() => authStore.user?.roles ?? [])
  const userPermissions = computed(() => authStore.user?.permissions ?? [])

  const isSuperAdmin = computed(() => userRoles.value.includes('SUPER_ADMIN'))

  /**
   * Pass a single permission for a specific action (`can('students.create')`)
   * or several for an OR check (`can('students.update', 'students.delete')`
   * — CASL's "manage" equivalent). SUPER_ADMIN always passes.
   */
  function can(...permissions: string[]): boolean {
    if (isSuperAdmin.value) return true
    return permissions.some((p) => userPermissions.value.includes(p))
  }

  return {
    userRoles,
    userPermissions,
    isSuperAdmin,
    can,
  }
}
