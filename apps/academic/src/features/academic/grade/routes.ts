import type { RouteRecordRaw } from 'vue-router'

export const gradeRoutes: RouteRecordRaw[] = [
  {
    path: '/academic/grade',
    name: 'grade',
    component: () => import('./views/GradeView.vue'),
    meta: {
      requiresAuth: true,
      // `classrooms.read`, matching the menu and the endpoint. It asked for
      // `academic-years.read`, so the gate on the way in and the gate at the
      // API disagreed about who this screen is for.
      // Reference data behind the class list. Editing it is a school-structure
      // decision; reading the classes it groups is not.
      requiredPermission: 'classrooms.update',
      title: 'Tingkat Kelas',
      breadcrumbs: [
        { title: 'Akademik', href: '#' },
        { title: 'Tingkat Kelas', href: '/academic/grade' },
      ],
    },
  },
]
