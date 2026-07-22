import type { RouteRecordRaw } from 'vue-router'

export const socialMediaRoutes: RouteRecordRaw[] = [
  {
    path: '/social-medias',
    name: 'SocialMedia',
    component: () => import('./views/SocialMediaView.vue'),
    meta: {
      title: 'SocialMedia Sosial Media',
      requiresAuth: true,
      requiredPermission: 'social-media.read',
    },
  },
]
