import { authApi } from '../api/authApi'
import { useAuthStore } from '../stores/authStore'
import type { LoginPayload } from '../types'
import {
  setAccessToken,
  clearSession,
  restoreSession as mintTokenFromCookie,
} from '@/shared/utils/api'
import { getIndonesianErrorMessage } from '@/shared/utils/error-handler'
import { authSessionService } from './authSessionService'
import { authIdentityService } from './authIdentityService'
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
      // Not data.user: the login response carries no permissions. Reading the
      // identity back is also what makes signing in and restoring a session
      // produce the same user object.
      const user = await authIdentityService.fetchIdentity()
      authSessionService.persistUser(user)

      const store = useAuthStore()
      store.setUser(user)

      return { ...data, user }
    } catch (error) {
      throw new Error(
        getIndonesianErrorMessage(error, 'Login gagal. Silakan coba lagi.'),
        { cause: error },
      )
    }
  },

  /**
   * Bring this app up against whatever session already exists.
   *
   * The refresh cookie belongs to the API host, so it is shared by every app in
   * the workspace — but `localStorage` is per-origin, so the first visit to a
   * given app has a live session and no idea who it belongs to. Left alone the
   * route guard reads that emptiness as "signed out" and shows a login form to
   * someone who is already signed in.
   *
   * Deliberately writes only to `localStorage`, never to Pinia: this runs
   * before `app.use(store)`, so there is no active Pinia yet. The router guard
   * hydrates the store from the key on the first navigation.
   *
   * @returns whether a usable session was restored.
   */
  restoreSession: async (): Promise<boolean> => {
    const refreshed = await mintTokenFromCookie()
    if (!refreshed) return false

    // This origin already knows the user — the guard can hydrate from storage,
    // and the shell refreshes it after mount anyway.
    if (authSessionService.hydrateUser()) return true

    try {
      authSessionService.persistUser(await authIdentityService.fetchIdentity())
      return true
    } catch {
      // A token without an identity is not a session anyone can act on. Drop
      // it rather than letting the guard bounce between dashboard and login.
      clearSession()
      return false
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
