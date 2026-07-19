import '@/shared/types/router'
import { authRoutes } from '@/features/platform/auth'
import { profileRoutes } from '@/features/platform/profile'
import { admissionRoutes } from '@/features/admission/routes'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/features/platform/auth/stores/authStore'
import { authSessionService } from '@/features/platform/auth/services/authSessionService'

const ACCESS_TOKEN_KEY = 'siakad_access_token'

function readStoredAccessToken() {
  if (typeof window === 'undefined') return null

  return (
    window.sessionStorage.getItem(ACCESS_TOKEN_KEY) ??
    window.localStorage.getItem(ACCESS_TOKEN_KEY) ??
    null
  )
}

function isAdminUser(roles: string[]) {
  return roles.includes('ADMIN') || roles.includes('SUPER_ADMIN')
}

/** Role-aware home: admins land on the admin panel, applicants on their portal. */
export function resolveHomeRoute(roles: string[]) {
  return isAdminUser(roles) ? '/admin' : '/pendaftaran'
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    ...admissionRoutes,
    ...authRoutes,
    ...profileRoutes,
    {
      // Platform login redirects to { name: 'dashboard' } after login;
      // resolve it per role instead of a fixed page.
      path: '/dashboard',
      name: 'dashboard',
      redirect: () => {
        const user = authSessionService.hydrateUser()
        return resolveHomeRoute(user?.roles ?? [])
      },
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/shared/views/NotFoundView.vue'),
      meta: { title: 'Halaman Tidak Ditemukan' },
    },
  ],
})

router.beforeEach((to) => {
  const store = useAuthStore()
  if (!store.user) {
    const user = authSessionService.hydrateUser()
    if (user) {
      store.setUser(user)
    }
  }

  const hasToken = Boolean(readStoredAccessToken())

  if (to.meta.requiresAuth && !hasToken) {
    return { name: 'login' }
  }

  if (to.meta.guestOnly && hasToken) {
    return resolveHomeRoute(store.user?.roles ?? [])
  }

  const allowedRoles = to.meta.allowedRoles
  if (allowedRoles && allowedRoles.length > 0) {
    const user = store.user
    if (user) {
      const userRoles = user.roles ?? []
      if (userRoles.includes('SUPER_ADMIN')) return true
      const hasAccess = allowedRoles.some((r: string) => userRoles.includes(r))
      if (!hasAccess) {
        return resolveHomeRoute(userRoles)
      }
    } else {
      return { name: 'login' }
    }
  }

  return true
})

router.afterEach((to) => {
  const title = to.meta.title
  document.title = title ? `${title} — PSB 241` : 'PSB 241'
})

export default router
