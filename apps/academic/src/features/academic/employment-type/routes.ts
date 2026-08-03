import type { RouteRecordRaw } from 'vue-router'

export const employmentTypeRoutes: RouteRecordRaw[] = [
  {
    path: '/setting/employment-type',
    name: 'EmploymentTypeList',
    component: () => import('./views/EmploymentTypeListView.vue'),
    meta: {
      title: 'Status Kepegawaian',
      requiresAuth: true,
      requiredPermission: 'teachers.read',
      breadcrumbs: [
        { title: 'Pengaturan', href: '#' },
        { title: 'Status Kepegawaian', href: '/setting/employment-type' },
      ],
    },
  },
]
