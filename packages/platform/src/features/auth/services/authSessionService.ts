import type { AuthUser } from '../types'

const USER_KEY = 'siakad_user'

export const authSessionService = {
  persistUser: (user: AuthUser) => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(USER_KEY, JSON.stringify(user))
    }
  },

  hydrateUser: (): AuthUser | null => {
    if (typeof window === 'undefined') return null

    const storedUser = window.localStorage.getItem(USER_KEY)
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser)
        if (parsed) {
          if (!parsed.roles && parsed.role) {
            parsed.roles = [parsed.role]
          }
          if (!parsed.permissions) {
            parsed.permissions = []
          }
          if (!parsed.identifier && parsed.username) {
            parsed.identifier = parsed.username
          }
        }
        return parsed as AuthUser
      } catch {
        return null
      }
    }
    return null
  },

  clearPersistedSession: () => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(USER_KEY)
    }
  },
}
