import '@/shared/types/router'
import { authRoutes } from '@/features/platform/auth'
import { dashboardRoutes } from '@/features/platform/dashboard'
import { schoolUnitRoutes } from '@/features/platform/school-unit'
import { organizationRoutes } from '@/features/platform/organization'
import { fileRoutes } from '@/features/platform/file'
import { profileRoutes } from '@/features/platform/profile'
import { userRoleRoutes } from '@/features/platform/user-role'
import { rolesRoutes } from '@/features/platform/role'
import { auditLogsRoutes } from '@/features/platform/audit-log'
import { schoolUnitTypeRoutes } from '@/features/platform/school-unit-type'
import { religionRoutes } from '@/features/platform/religion'
import { bloodTypeRoutes } from '@/features/platform/blood-type'
import { achievementTypeRoutes } from '@/features/platform/achievement-type'
import { inventoryRoutes } from '@/features/inventory/routes'
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

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    ...dashboardRoutes,
    ...authRoutes,
    ...schoolUnitRoutes,
    ...organizationRoutes,
    ...fileRoutes,
    ...userRoleRoutes,
    ...rolesRoutes,
    ...auditLogsRoutes,
    ...profileRoutes,
    ...schoolUnitTypeRoutes,
    ...religionRoutes,
    ...bloodTypeRoutes,
    ...achievementTypeRoutes,
    ...inventoryRoutes,
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
    return { name: 'dashboard' }
  }

  const allowedRoles = to.meta.allowedRoles
  if (allowedRoles && allowedRoles.length > 0) {
    const user = store.user
    if (user) {
      const userRoles = user.roles ?? []
      if (userRoles.includes('SUPER_ADMIN')) return true
      const hasAccess = allowedRoles.some((r: string) => userRoles.includes(r))
      if (!hasAccess) {
        return { name: 'dashboard' }
      }
    } else {
      return { name: 'login' }
    }
  }

  return true
})

router.afterEach((to) => {
  const title = to.meta.title
  document.title = title ? `${title} — SIMAS` : 'SIMAS'
})

export default router
