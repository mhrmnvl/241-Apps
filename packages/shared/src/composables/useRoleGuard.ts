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

  return {
    userRoles,
    isAdmin,
    isTeacher,
    isStudent,
    canManage,
    canContribute,
    hasRole,
  }
}
