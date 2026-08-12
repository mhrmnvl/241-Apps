import '@/shared/types/router'
import { authRoutes } from '@/features/platform/auth'
import { dashboardRoutes } from '@/features/platform/dashboard'
import { profileRoutes } from '@/features/platform/profile'
import { credentialRoutes } from '@/features/presence/credential'
import { presenceDeviceRoutes } from '@/features/presence/device'
import { employeeAttendanceRoutes } from '@/features/presence/employee-attendance'
import { workPatternRoutes } from '@/features/presence/work-pattern'
import { leaveRoutes } from '@/features/presence/leave'
import { leaveTypeRoutes } from '@/features/presence/leave-type'
import { kioskRoutes } from '@/features/presence/kiosk'
import { salaryComponentRoutes } from '@/features/payroll/component'
import { salaryAssignmentRoutes } from '@/features/payroll/assignment'
import { payrollRunRoutes } from '@/features/payroll/run'
import { payslipRoutes } from '@/features/payroll/payslip'
import { settingsRoutes, useSettingsStore } from '@/features/platform/settings'
import { createRouter, createWebHistory } from 'vue-router'
import { authSessionService, useAuthStore } from '@/features/platform/auth'
import { menuSections } from '@/config/menuConfig'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/dashboard',
    },
    ...authRoutes,
    // Unattended gate terminal: no app shell and no user session — it
    // authenticates as a device (research R7), so it must stay outside
    // AppLayout and outside the auth guard.
    ...kioskRoutes,
    {
      path: '/',
      component: () => import('@/layouts/AppLayout.vue'),
      // Children keep their absolute paths — Vue Router treats a nested path
      // starting with '/' as a root path, which is what lets the shell wrap
      // these routes without changing a single URL.
      children: [
        ...dashboardRoutes,
        ...credentialRoutes,
        ...presenceDeviceRoutes,
        ...employeeAttendanceRoutes,
        ...workPatternRoutes,
        ...leaveRoutes,
        ...leaveTypeRoutes,
        ...salaryComponentRoutes,
        ...salaryAssignmentRoutes,
        ...payrollRunRoutes,
        ...payslipRoutes,
        ...profileRoutes,
        ...settingsRoutes,
        {
          path: '/pengaturan/umum',
          name: 'setting-general',
          component: () =>
            import('@/features/platform/settings/views/AppSettingsView.vue'),
          props: { appKey: 'PRESENCE', menuSections },
          meta: {
            requiresAuth: true,
            requiredPermission: 'settings.update',
            title: 'Pengaturan Umum',
            breadcrumbs: [{ title: 'Pengaturan Umum' }],
          },
        },
      ],
    },
    {
      // Outside the layout route on purpose: the shell applies only when the
      // visitor is signed in, and NotFoundPage owns that decision.
      path: '/:pathMatch(.*)*',
      name: 'not-found',
      component: () => import('@/layouts/NotFoundPage.vue'),
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
      return { name: 'dashboard' }
    }
  }

  return true
})

router.afterEach((to) => {
  const title = to.meta.title
  if (typeof title === 'string') document.title = title
})

export default router
