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
   * Permission gate for buttons/actions, named after intent (CASL-style).
   * SUPER_ADMIN always passes. Pass a single permission for a specific action
   * (`can('students.create')`) or several for an OR check
   * (`can('students.update', 'students.delete')` → "can manage").
   */
  function can(...permissions: string[]): boolean {
    if (isSuperAdmin.value) return true
    return permissions.some((p) => userPermissions.value.includes(p))
  }

  // Backwards-compatible alias.
  const hasPermission = can

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
    can,
    hasPermission,
  }
}
