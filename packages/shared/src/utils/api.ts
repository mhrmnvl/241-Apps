import axios from 'axios'
import type {
  AxiosError,
  AxiosRequestConfig,
  InternalAxiosRequestConfig,
} from 'axios'
import { toast } from 'vue-sonner'
import type { RefreshTokenResponse } from '@/features/platform/auth'

const API_BASE_URL = (
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  'http://localhost:3000'
).replace(/\/+$/, '')

const USER_KEY = 'siakad_user'

// The access token is kept in memory only — never in localStorage/sessionStorage.
// This means an injected script (XSS) cannot read it from web storage and it is
// not persisted to disk or shared across tabs. On a full page reload the token
// is intentionally lost and silently re-minted from the HttpOnly refresh cookie
// by the 401 interceptor below. The refresh token itself stays in an HttpOnly
// cookie, unreachable by JavaScript.
let accessToken: string | null = null

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

function getAccessToken(): string | null {
  return accessToken?.trim() ? accessToken : null
}

function setAccessToken(token: string) {
  accessToken = token
}

function clearSession() {
  accessToken = null
  if (typeof window !== 'undefined') {
    window.localStorage.removeItem(USER_KEY)
  }
}

/**
 * Restore the session once at app startup, before the router resolves.
 *
 * The access token lives in memory only, so on a fresh page load there is no
 * token yet. This mints one from the HttpOnly refresh cookie up front:
 *  - success → the first API calls already carry a token (no 401 flash), and
 *    the optimistically-persisted user is confirmed valid.
 *  - failure → the session is dead/absent, so the stale persisted user is
 *    cleared (via clearSession) and the guard lands cleanly on /login instead
 *    of bouncing dashboard ⇄ login.
 *
 * Uses a raw axios call so it bypasses the 401 interceptor (no recursion).
 */
async function restoreSession(): Promise<boolean> {
  try {
    const res = await axios.post<RefreshTokenResponse>(
      `${API_BASE_URL}/auth/refresh`,
      {},
      { withCredentials: true },
    )
    const token: string | undefined =
      res.data?.data?.accessToken ?? res.data?.accessToken
    if (!token) throw new Error('No access token in refresh response')
    setAccessToken(token)
    return true
  } catch {
    clearSession()
    return false
  }
}

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // Retrieve the school unit ID from local storage for multi-tenancy
  try {
    const storedUser = window.localStorage.getItem(USER_KEY)
    if (storedUser) {
      const parsed = JSON.parse(storedUser)
      if (parsed?.schoolUnitId) {
        config.headers['x-school-unit-id'] = parsed.schoolUnitId
      }
    }
  } catch (e) {
    console.error('Failed to parse siakad_user from localStorage', e)
  }

  if (config.data instanceof FormData) {
    delete config.headers['Content-Type']
  }
  return config
})

let isRefreshing = false
let pendingRequests: {
  resolve: (token: string) => void
  reject: (err: unknown) => void
}[] = []

function subscribeTokenRefresh(
  resolve: (token: string) => void,
  reject: (err: unknown) => void,
) {
  pendingRequests.push({ resolve, reject })
}

function notifySubscribers(newToken: string) {
  pendingRequests.forEach(({ resolve }) => resolve(newToken))
  pendingRequests = []
}

function rejectSubscribers(err: unknown) {
  pendingRequests.forEach(({ reject }) => reject(err))
  pendingRequests = []
}

api.interceptors.response.use(
  (response) => {
    const data: unknown = response.data
    if (data instanceof Blob || data instanceof ArrayBuffer) {
      return response
    }
    if (data && typeof data === 'object' && 'data' in data) {
      return { ...response, data: data as Record<string, unknown> }
    }
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as
      | (InternalAxiosRequestConfig & { _retry?: boolean })
      | undefined

    const isAuthEndpoint = originalRequest?.url?.includes('/auth/')
    const isRetry = originalRequest?._retry === true

    if (error.response?.status === 401 && !isAuthEndpoint && !isRetry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          subscribeTokenRefresh((newToken: string) => {
            if (originalRequest) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`
              resolve(api(originalRequest as AxiosRequestConfig))
            }
          }, reject)
        })
      }

      if (originalRequest) {
        originalRequest._retry = true
      }
      isRefreshing = true

      try {
        const refreshResponse = await axios.post<RefreshTokenResponse>(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true },
        )

        const envelope = refreshResponse.data
        const newToken: string | undefined =
          envelope?.data?.accessToken ?? envelope?.accessToken

        if (!newToken) throw new Error('No access token in refresh response')

        setAccessToken(newToken)
        notifySubscribers(newToken)
        if (originalRequest) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`
          return api(originalRequest as AxiosRequestConfig)
        }
      } catch {
        clearSession()
        rejectSubscribers(new Error('Token refresh failed'))
        toast.error('Sesi telah berakhir', {
          description: 'Kamu akan diarahkan ke halaman login.',
          duration: 4000,
        })
        setTimeout(() => {
          if (window.location.pathname !== '/login') {
            window.location.href = '/login'
          }
        }, 1500)
      } finally {
        isRefreshing = false
      }
    }

    return Promise.reject(error)
  },
)

export default api
export { clearSession, getAccessToken, restoreSession, setAccessToken }
