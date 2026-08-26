import type { RouteRecordRaw } from 'vue-router'

export const socialMediaRoutes: RouteRecordRaw[] = [
  {
    path: '/setting/social-media',
    name: 'SocialMedia',
    component: () => import('./views/SocialMediaView.vue'),
    meta: {
      // The route's own name had been pasted in front of the title.
      title: 'Sosial Media',
      requiresAuth: true,
      requiredPermission: 'social-media.read',
      breadcrumbs: [
        { title: 'Pengaturan', href: '#' },
        { title: 'Data Profil', href: '#' },
        { title: 'Sosial Media' },
      ],
    },
  },
]
