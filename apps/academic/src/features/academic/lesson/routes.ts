import type { RouteRecordRaw } from 'vue-router'

export const lessonRoutes: RouteRecordRaw[] = [
  {
    path: '/pembelajaran/jadwal-pelajaran',
    name: 'lesson',
    component: () => import('./views/LessonView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'schedules.read',
      title: 'Jadwal Pelajaran',
    },
  },
  {
    path: '/pembelajaran/jadwal-pelajaran/:classroomId',
    name: 'classroom-schedule-editor',
    component: () => import('./views/ClassroomScheduleEditorView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'schedules.read',
      title: 'Editor Jadwal Kelas',
    },
  },
]
