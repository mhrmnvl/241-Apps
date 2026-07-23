import type { RouteRecordRaw } from 'vue-router'

export const semesterTypeRoutes: RouteRecordRaw[] = [
  {
    path: '/setting/semester-type',
    name: 'SemesterTypeList',
    component: () => import('./views/SemesterTypeListView.vue'),
    meta: {
      title: 'Tipe Semester',
      requiresAuth: true,
    },
  },
]
