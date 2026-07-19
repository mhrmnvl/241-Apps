import { authApi } from '../api/authApi'
import { useAuthStore } from '../stores/authStore'
import type { LoginPayload } from '../types'
import { setAccessToken, clearSession } from '@/shared/utils/api'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { authSessionService } from './authSessionService'
import { authProfileService } from './authProfileService'

export const authService = {
  loginUser: async (payload: LoginPayload) => {
    try {
      const response = await authApi.login(payload)
      const data = response.data?.data

      if (!data?.accessToken) {
        throw new Error('Login gagal. Silakan coba lagi.')
      }

      setAccessToken(data.accessToken)
      const enrichedUser = await authProfileService.enrichUserWithProfile(
        data.user,
      )
      authSessionService.persistUser(enrichedUser)

      const store = useAuthStore()
      store.setUser(enrichedUser)

      return { ...data, user: enrichedUser }
    } catch (error) {
      throw new Error(
        getIndonesianErrorMessage(error, 'Login gagal. Silakan coba lagi.'),
        { cause: error },
      )
    }
  },

  logoutUser: async () => {
    try {
      await authApi.logout()
    } catch (error) {
      void error
    } finally {
      clearSession()
      authSessionService.clearPersistedSession()
      const store = useAuthStore()
      store.clearUser()
    }
  },

  syncAuthenticatedUserProfile: async () => {
    const store = useAuthStore()
    if (!store.user) return null

    const enrichedUser = await authProfileService.enrichUserWithProfile(
      store.user,
    )
    store.setUser(enrichedUser)
    authSessionService.persistUser(enrichedUser)

    return enrichedUser
  },
}
