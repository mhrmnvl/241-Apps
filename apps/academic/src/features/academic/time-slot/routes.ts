import type { RouteRecordRaw } from 'vue-router'

export const timeSlotRoutes: RouteRecordRaw[] = [
  {
    path: '/pembelajaran/jam-pelajaran',
    name: 'time-slot',
    component: () => import('./views/TimeSlotView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['ADMIN', 'TEACHER'],
      title: 'Jam Pelajaran',
    },
  },
  {
    path: '/pembelajaran/tipe-jam',
    name: 'time-slot-type',
    component: () => import('./views/TimeSlotTypeView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['ADMIN', 'TEACHER'],
      title: 'Tipe Jam',
    },
  },
]
