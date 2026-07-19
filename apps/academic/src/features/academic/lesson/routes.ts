import type { RouteRecordRaw } from 'vue-router'

export const lessonRoutes: RouteRecordRaw[] = [
  {
    path: '/pembelajaran/jadwal-pelajaran',
    name: 'lesson',
    component: () => import('./views/LessonView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['ADMIN', 'TEACHER'],
      title: 'Jadwal Pelajaran',
    },
  },
  {
    path: '/pembelajaran/jadwal-pelajaran/:classroomId',
    name: 'classroom-schedule-editor',
    component: () => import('./views/ClassroomScheduleEditorView.vue'),
    meta: {
      requiresAuth: true,
      allowedRoles: ['ADMIN', 'TEACHER'],
      title: 'Editor Jadwal Kelas',
    },
  },
]
