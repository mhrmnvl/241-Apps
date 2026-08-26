import type { RouteRecordRaw } from 'vue-router'

export const academicCalendarRoutes: RouteRecordRaw[] = [
  {
    path: '/academic/education-calendar',
    name: 'academic-calendar',
    component: () => import('./views/AcademicCalendarView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'academic-calendars.read',
      title: 'Kalender Pendidikan',
      breadcrumbs: [
        { title: 'Akademik', href: '#' },
        { title: 'Kalender Pendidikan', href: '#' },
        { title: 'Kalender' },
      ],
    },
  },
  {
    path: '/academic/education-calendar/manage',
    name: 'academic-calendar-manage',
    component: () => import('./views/AcademicCalendarManageView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'academic-calendars.create',
      title: 'Manajemen Kalender',
      breadcrumbs: [
        { title: 'Akademik', href: '#' },
        { title: 'Kalender Pendidikan', href: '#' },
        { title: 'Manajemen Kalender' },
      ],
    },
  },
  {
    path: '/academic/education-calendar/manage/create',
    name: 'academic-calendar-create',
    component: () => import('./views/AcademicCalendarFormView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'academic-calendars.create',
      title: 'Tambah Agenda Kalender',
      breadcrumbs: [
        { title: 'Akademik', href: '#' },
        { title: 'Kalender Pendidikan', href: '#' },
        {
          title: 'Manajemen Kalender',
          href: '/academic/education-calendar/manage',
        },
        { title: 'Tambah Agenda' },
      ],
    },
  },
  {
    path: '/academic/education-calendar/manage/:id/edit',
    name: 'academic-calendar-edit',
    component: () => import('./views/AcademicCalendarFormView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'academic-calendars.update',
      title: 'Edit Agenda Kalender',
      breadcrumbs: [
        { title: 'Akademik', href: '#' },
        { title: 'Kalender Pendidikan', href: '#' },
        {
          title: 'Manajemen Kalender',
          href: '/academic/education-calendar/manage',
        },
        { title: 'Edit Agenda' },
      ],
    },
  },
]
