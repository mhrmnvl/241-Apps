import '@/shared/types/router'
import { authRoutes } from '@/features/platform/auth'
import { profileRoutes } from '@/features/platform/profile'
import { settingsRoutes, useSettingsStore } from '@/features/platform/settings'
import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/features/platform/auth'
import { authSessionService } from '@/features/platform/auth'
import { portalAgendaRoutes, portalPublicAgendaRoutes } from '@/features/agenda'
import {
  portalGalleryRoutes,
  portalPublicGalleryRoutes,
} from '@/features/gallery'
import { portalHomeRoutes } from '@/features/homepage'
import { portalPageRoutes, portalPublicPageRoutes } from '@/features/page'
import { portalPostRoutes, portalPublicPostRoutes } from '@/features/post'
import { portalTaxonomyRoutes } from '@/features/taxonomy'
import { menuSections } from '@/config/menuConfig'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // Public pages first: the layout route below also answers to '/', and Vue
    // Router matches in order, so the public tree has to be seen first.
    //
    // The shell is composed here rather than inside a feature, because several
    // features share it — homepage owns '/', post owns '/berita' and '/artikel'.
    {
      path: '/',
      component: () => import('@/layouts/PublicLayout.vue'),
      children: [
        ...portalHomeRoutes,
        ...portalPublicPostRoutes,
        ...portalPublicAgendaRoutes,
        ...portalPublicGalleryRoutes,
        // Last: '/:pageSlug' matches anything, so every named public route has
        // to be seen first.
        ...portalPublicPageRoutes,
      ],
    },
    ...authRoutes,
    {
      path: '/',
      component: () => import('@/layouts/AppLayout.vue'),
      // Children keep their absolute paths — a nested path starting with '/'
      // is treated as a root path, which is what lets the shell wrap these
      // routes without changing a single URL.
      children: [
        ...portalPostRoutes,
        ...portalTaxonomyRoutes,
        ...portalPageRoutes,
        ...portalAgendaRoutes,
        ...portalGalleryRoutes,
        ...profileRoutes,
        ...settingsRoutes,
        {
          path: '/setting/general',
          name: 'setting-general',
          component: () =>
            import('@/features/platform/settings/views/AppSettingsView.vue'),
          props: { appKey: 'PORTAL', menuSections },
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
      // Platform login redirects to { name: 'dashboard' } after login. The
      // portal has no separate dashboard yet — US1 (T060) points this at the
      // content management area.
      path: '/dashboard',
      name: 'dashboard',
      redirect: () => ({ name: 'admin-berita' }),
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

  // The access token lives in memory only, so it is gone after a reload. The
  // persisted user (non-secret profile/roles) is the optimistic gate; real
  // enforcement stays server-side.
  const hasSession = Boolean(store.user)

  // Maintenance mode is per-app. The portal's own flag can close the public
  // site, but SIAKAD's cannot — that separation is the point of giving the
  // portal its own AppKey (FR-003, SC-006).
  const settingsStore = useSettingsStore()
  const userRoles = store.user?.roles ?? []
  if (
    settingsStore.maintenanceMode &&
    !userRoles.includes('SUPER_ADMIN') &&
    to.name !== 'login' &&
    to.name !== 'maintenance'
  ) {
    return { name: 'maintenance' }
  }

  if (to.meta.requiresAuth && !hasSession) {
    return { name: 'login' }
  }

  if (to.meta.guestOnly && hasSession) {
    return { name: 'portal-home' }
  }

  // Permission gate — preferred over allowedRoles so custom roles are granted
  // access by the permissions they hold.
  //
  // SUPER_ADMIN passes here to mirror PermissionGuard, which keeps its bypass
  // as break-glass. ADMIN deliberately does NOT: the guard's exemption stops
  // the blanket bypass at `portal-*`, and a UI that offered actions the API
  // then refused would be worse than no UI at all (T069, ADR-0006).
  const requiredPermission = to.meta.requiredPermission
  if (requiredPermission) {
    const user = store.user
    if (!user) return { name: 'login' }
    const userPermissions = user.permissions ?? []
    if (
      !userRoles.includes('SUPER_ADMIN') &&
      !userPermissions.includes(requiredPermission)
    ) {
      return { name: 'portal-home' }
    }
  }

  return true
})

router.afterEach((to) => {
  const title = to.meta.title
  if (typeof title === 'string') document.title = title
})

export default router
