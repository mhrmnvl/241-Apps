import '@/shared/types/router'
import { authRoutes } from '@/features/platform/auth'
import { profileRoutes } from '@/features/platform/profile'
import { admissionPublicRoutes, admissionRoutes } from '@/features/admission'
import { settingsRoutes, useSettingsStore } from '@/features/platform/settings'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/features/platform/auth/stores/authStore'
import { authSessionService } from '@/features/platform/auth/services/authSessionService'
import { menuSections } from '@/config/menuConfig'

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
    // Shell-less pages first: the layout route below also answers to '/', and
    // routes are matched in order, so the landing page has to be seen first.
    ...admissionPublicRoutes,
    ...authRoutes,
    {
      path: '/',
      component: () => import('@/layouts/AppLayout.vue'),
      // Children keep their absolute paths — Vue Router treats a nested path
      // starting with '/' as a root path, which is what lets the shell wrap
      // these routes without changing a single URL.
      children: [...admissionRoutes],
    },
    // Still flat: these render platform views, which wrap themselves in the
    // shell today. They move under the layout route once all three apps have
    // one (issue #25).
    ...profileRoutes,
    ...settingsRoutes,
    {
      path: '/setting/general',
      name: 'setting-general',
      component: () =>
        import('@/features/platform/settings/views/AppSettingsView.vue'),
      props: { appKey: 'ADMISSION', menuSections },
      meta: {
        requiresAuth: true,
        requiredPermission: 'settings.update',
        title: 'Pengaturan Umum',
      },
    },
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
      component: () =>
        import('@/features/platform/auth/views/NotFoundView.vue'),
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

  // The access token now lives in memory only (see shared/utils/api), so it is
  // gone after a reload. Use the persisted user (non-secret profile/roles) as the
  // optimistic auth gate; real enforcement stays server-side — the API layer
  // silently refreshes on 401 or logs out if the refresh cookie is invalid.
  const hasSession = Boolean(store.user)

  // Admin-toggled maintenance mode blocks everyone except SUPER_ADMIN, who
  // still needs /login reachable to authenticate and flip it back off.
  const settingsStore = useSettingsStore()
  const isMaintenanceOn = settingsStore.maintenanceMode
  const userRolesForMaintenance = store.user?.roles ?? []
  if (
    isMaintenanceOn &&
    !userRolesForMaintenance.includes('SUPER_ADMIN') &&
    to.name !== 'login' &&
    to.name !== 'maintenance'
  ) {
    return { name: 'maintenance' }
  }

  if (to.meta.requiresAuth && !hasSession) {
    return { name: 'login' }
  }

  if (to.meta.guestOnly && hasSession) {
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

  // Permission gate — preferred over allowedRoles so custom roles are granted
  // access by the permissions they hold. SUPER_ADMIN always passes.
  const requiredPermission = to.meta.requiredPermission
  if (requiredPermission) {
    const user = store.user
    if (!user) return { name: 'login' }
    const userRoles = user.roles ?? []
    const userPermissions = user.permissions ?? []
    if (
      !userRoles.includes('SUPER_ADMIN') &&
      !userPermissions.includes(requiredPermission)
    ) {
      return resolveHomeRoute(userRoles)
    }
  }

  return true
})

router.afterEach((to) => {
  const title = to.meta.title
  if (typeof title === 'string') document.title = title
})

export default router
