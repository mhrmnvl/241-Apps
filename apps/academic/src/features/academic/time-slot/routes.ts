import type { RouteRecordRaw } from 'vue-router'

export const timeSlotRoutes: RouteRecordRaw[] = [
  {
    path: '/learning/time-slot',
    name: 'time-slot',
    component: () => import('./views/TimeSlotView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'time-slots.read',
      title: 'Jam Pelajaran',
      breadcrumbs: [
        { title: 'Pembelajaran', href: '#' },
        { title: 'Jam Pelajaran', href: '/learning/time-slot' },
      ],
    },
  },
  {
    path: '/setting/time-slot-type',
    name: 'time-slot-type',
    component: () => import('./views/TimeSlotTypeView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'time-slots.read',
      title: 'Tipe Jam',
      breadcrumbs: [
        { title: 'Referensi', href: '#' },
        { title: 'Tipe Jam', href: '/setting/time-slot-type' },
      ],
    },
  },
]
