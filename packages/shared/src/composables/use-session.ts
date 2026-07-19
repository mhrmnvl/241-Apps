import { ref, readonly } from 'vue'
import type { AuthUser } from '@/features/platform/auth/types/session'

const USER_KEY = 'siakad_user'

export function useAuthSession() {
  const user = ref<AuthUser | null>(null)

  function loadUser() {
    try {
      if (typeof window !== 'undefined') {
        const stored = window.localStorage.getItem(USER_KEY)
        if (stored) {
          const parsed = JSON.parse(stored)
          if (parsed) {
            if (!parsed.roles && parsed.role) {
              parsed.roles = [parsed.role]
            }
            if (!parsed.identifier && parsed.username) {
              parsed.identifier = parsed.username
            }
          }
          user.value = parsed as AuthUser
        }
      }
    } catch (e) {
      console.error('Failed to parse user session', e)
    }
  }

  loadUser()

  return {
    user: readonly(user),
    reload: loadUser,
  }
}
