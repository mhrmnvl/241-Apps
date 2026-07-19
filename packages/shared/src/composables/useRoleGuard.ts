import { useAuthStore } from '@/features/platform/auth'
import { computed } from 'vue'

export function useRoleGuard() {
  const authStore = useAuthStore()
  const userRoles = computed(() => authStore.user?.roles ?? [])

  const isAdmin = computed(() =>
    userRoles.value.some((r) => r === 'SUPER_ADMIN' || r === 'ADMIN'),
  )
  const isTeacher = computed(() => userRoles.value.includes('TEACHER'))
  const isStudent = computed(() => userRoles.value.includes('STUDENT'))

  const canManage = computed(() => isAdmin.value)
  const canContribute = computed(() => isAdmin.value || isTeacher.value)

  function hasRole(...roles: string[]): boolean {
    return userRoles.value.some((r) => roles.includes(r))
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
