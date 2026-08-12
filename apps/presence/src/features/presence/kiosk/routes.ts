import type { RouteRecordRaw } from 'vue-router'

/**
 * The kiosk deliberately does NOT require a signed-in user.
 *
 * It runs unattended at a gate and authenticates as a device, so a staff
 * session left open there would be a full-privilege session anyone walking past
 * can reach (research R7). `requiresAuth: false` is what keeps the router from
 * bouncing it to the login page; the device token guards the actual endpoints.
 */
export const kioskRoutes: RouteRecordRaw[] = [
  {
    path: '/presensi/kiosk',
    name: 'PresenceKiosk',
    component: () => import('./views/KioskView.vue'),
    meta: {
      title: 'Kiosk Presensi',
      requiresAuth: false,
      layout: 'blank',
    },
  },
]
