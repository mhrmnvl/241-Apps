import type { RouteRecordRaw } from 'vue-router'

export const academicSettingRoutes: RouteRecordRaw[] = [
  {
    path: '/academic/setting',
    name: 'academic-setting',
    component: () => import('./views/AcademicSettingView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'academic-settings.read',
      title: 'Pengaturan Akademik',
      breadcrumbs: [
        { title: 'Akademik', href: '#' },
        { title: 'Pengaturan Akademik', href: '/academic/setting' },
      ],
    },
  },
]
