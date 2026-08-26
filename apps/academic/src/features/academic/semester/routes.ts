import type { RouteRecordRaw } from 'vue-router'

export const semesterRoutes: RouteRecordRaw[] = [
  {
    path: '/academic/semester',
    name: 'semester',
    component: () => import('./views/SemesterView.vue'),
    meta: {
      requiresAuth: true,
      // Every screen with a term picker reads this list, so the read is held
      // widely and only the editing belongs behind this route.
      requiredPermission: 'semesters.update',
      title: 'Semester',
      breadcrumbs: [
        { title: 'Akademik', href: '#' },
        { title: 'Semester', href: '/academic/semester' },
      ],
    },
  },
  {
    path: '/academic/semester/promotion',
    name: 'promotion',
    component: () => import('./views/PromotionView.vue'),
    meta: {
      requiresAuth: true,
      // The page exists to run a promotion; every button on it posts to an
      // endpoint guarded by `semesters.create`. Guarding the route on `read`
      // let someone in to a screen where nothing would work.
      requiredPermission: 'semesters.create',
      title: 'Kenaikan Kelas',
      breadcrumbs: [
        { title: 'Akademik', href: '#' },
        { title: 'Semester', href: '/academic/semester' },
        { title: 'Kenaikan Kelas', href: '/academic/semester/promotion' },
      ],
    },
  },
]
