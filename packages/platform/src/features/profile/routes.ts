import type { RouteRecordRaw } from 'vue-router'

export const profileRoutes: RouteRecordRaw[] = [
  {
    path: '/profile',
    name: 'profile-view',
    component: () => import('./views/ProfileView.vue'),
    meta: { requiresAuth: true, title: 'Profil' },
  },
  {
    path: '/profile/:role/:id',
    name: 'profile-other-view',
    component: () => import('./views/ProfileView.vue'),
    meta: {
      requiresAuth: true,
      title: 'Profil Pengguna',
      requiredPermission: 'profiles.read',
    },
  },
]
