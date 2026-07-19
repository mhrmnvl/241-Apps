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

const ACCESS_TOKEN_KEY = 'siakad_access_token'

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
})

function getAccessToken(): string | null {
  for (const storage of [window.sessionStorage, window.localStorage]) {
    const token = storage.getItem(ACCESS_TOKEN_KEY)
    if (token?.trim()) return token
  }
  return null
}

function setAccessToken(token: string) {
  window.sessionStorage.setItem(ACCESS_TOKEN_KEY, token)
  window.localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

function clearSession() {
  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY)
  window.localStorage.removeItem(ACCESS_TOKEN_KEY)
  window.localStorage.removeItem('siakad_user')
}

api.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  // Retrieve the school unit ID from local storage for multi-tenancy
  try {
    const storedUser = window.localStorage.getItem('siakad_user')
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
export { ACCESS_TOKEN_KEY, clearSession, getAccessToken, setAccessToken }
