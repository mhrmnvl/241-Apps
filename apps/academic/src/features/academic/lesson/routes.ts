import type { RouteRecordRaw } from 'vue-router'

export const lessonRoutes: RouteRecordRaw[] = [
  {
    path: '/learning/lesson',
    name: 'lesson',
    component: () => import('./views/LessonView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'schedules.read',
      title: 'Jadwal Pelajaran',
      breadcrumbs: [
        { title: 'Pembelajaran', href: '#' },
        { title: 'Jadwal Pelajaran' },
      ],
    },
  },
  {
    path: '/learning/lesson/:classroomId',
    name: 'classroom-schedule-editor',
    component: () => import('./views/ClassroomScheduleEditorView.vue'),
    meta: {
      requiresAuth: true,
      requiredPermission: 'schedules.read',
      title: 'Editor Jadwal Kelas',
    },
  },
]
